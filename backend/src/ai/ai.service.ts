import { GoogleGenAI } from '@google/genai';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AiMetricsService } from './ai-metrics.service';
import { BaselineService } from './baseline.service';
import { ConfigService } from '@nestjs/config';
import { StartupReadinessLevel } from 'src/entities/startup-readiness-level.entity';
import { Startup } from 'src/entities/startup.entity';
import { StartupApplicationDto } from 'src/startup/dto/startup.dto';
import { z } from 'zod';

const AI_GROUNDING_INSTRUCTION =
  'Only use facts explicitly present in the user-provided input. Never invent names, numbers, dates, or organizations. If you are uncertain about a field, return null instead of guessing.';

const readinessRnaSchema = z.array(
  z.object({
    readiness_level_type: z.string(),
    rna: z.string().nullable(),
  }),
);

const readinessTaskSchema = z.array(
  z.object({
    target_level: z.coerce.number().int().min(0),
    description: z.string(),
  }),
);

const readinessInitiativeSchema = z.array(
  z.object({
    description: z.string(),
    measures: z.string(),
    targets: z.string(),
    remarks: z.string(),
  }),
);

const readinessRoadblockSchema = z.array(
  z.object({
    description: z.string(),
    fix: z.string(),
    riskNumber: z.coerce.number().int().min(0),
  }),
);

@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;
  private readonly modelName = 'gemini-2.5-flash-lite';

  constructor(
    private config: ConfigService,
    private metrics: AiMetricsService,
    private baselineService: BaselineService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.config.get<string>('GEMINI_API_KEY'),
    });
  }

  // Normalize numeric AI scores using the baseline service. Returns scaled value 1-9.
  async normalizeAiScore(score: number) {
    try {
      const res = await this.baselineService.normalizeScore(score);
      return res;
    } catch (err) {
      // on error return a conservative mapping
      return { z: 0, scaled: Math.max(1, Math.min(9, Math.round(score))) };
    }
  }

  private groundPrompt(prompt: string) {
    return `${prompt}\n\nGrounding instruction: ${AI_GROUNDING_INSTRUCTION}`;
  }

  private extractJsonPayload(text: string) {
    const firstCurly = text.indexOf('{');
    const firstSquare = text.indexOf('[');
    const candidates = [firstCurly, firstSquare].filter((index) => index !== -1);
    const jsonStart = candidates.length ? Math.min(...candidates) : -1;
    const lastCurly = text.lastIndexOf('}');
    const lastSquare = text.lastIndexOf(']');
    const jsonEnd = Math.max(lastCurly, lastSquare);

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      return null;
    }

    return text.substring(jsonStart, jsonEnd + 1);
  }

  private async callAiExpectJson<T>(options: {
    prompt: string;
    schema: z.ZodType<T>;
    fallback: T;
    correctivePrompt: string;
  }): Promise<T> {
    const { prompt, schema, fallback, correctivePrompt } = options;

    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await this.ai.models.generateContent({
        model: this.modelName,
        contents: this.groundPrompt(attempt === 1 ? prompt : `${prompt}\n\n${correctivePrompt}`),
        temperature: attempt === 1 ? 0.0 : 0.2,
        maxOutputTokens: 1024,
      } as any);

      const text = res?.text?.trim();
      if (!text) {
        await this.metrics.recordFailure({ type: 'no_text', detail: { attempt } });
        continue;
      }

      const payload = this.extractJsonPayload(text);
      if (!payload) {
        await this.metrics.recordFailure({ type: 'no_json', detail: { attempt, snippet: text.slice(0, 1000) } });
        continue;
      }

      try {
        const parsed = JSON.parse(payload);
        const validated = schema.safeParse(parsed);

        if (validated.success) {
          return validated.data;
        }

        await this.metrics.recordFailure({
          type: 'schema_invalid',
          detail: { attempt, issues: validated.error.issues.map((issue) => issue.message) },
        });
      } catch (error) {
        await this.metrics.recordFailure({
          type: 'invalid_json',
          detail: { attempt, snippet: text.slice(0, 1000), error: error instanceof Error ? error.message : String(error) },
        });
      }
    }

    return fallback;
  }

  async test() {
    const res = await this.ai.models.generateContent({
      model: this.modelName,
      contents: this.groundPrompt('what is the lyrics for bloom necry talkie'),
    });
    return res.text;
  }

  async getCapsuleProposalInfo(text: string) {
    const res = await this.ai.models.generateContent({
      model: this.modelName,
      contents: this.groundPrompt(`Based on the text ${text},
        Task: extract the text for:
        -Acceleration Proposal Title ( can be found above the Duration: 3 months, etc.)
        - Startup Description
        - Problem Statement
        - Target Market
        - Solution Description
        - Objectives
        - Scope of The Proposal
        - Methodology and Expected Outputs

        Requirement: The response should be in a JSON format.
        It should consist of title, startup_description, problem_statement, target_market, solution_description, objectives, scope, and methodology
        JSON format: {"title": "", "startup_description": "", "problem_statement": (int), "target_market": "", "solution_description": "", "objectives": "", "scope": "", "methodology": ""}
        `),
    });
    return res.text;
  }

  async generateStartupAnalysisSummary(
    dto: StartupApplicationDto,
  ): Promise<string> {
    const res = await this.ai.models.generateContent({
      model: this.modelName,
      contents: this.groundPrompt(`Please provide a comprehensive analysis of the following startup proposal:
      
      Title: ${dto.title}
      Description: ${dto.description}
      Problem Statement: ${dto.problemStatement}
      Target Market: ${dto.targetMarket}
      Solution Description: ${dto.solutionDescription}
      Objectives: ${dto.objectives.join('\n')}
      Proposal Scope: ${dto.proposalScope}
      Methodology: ${dto.methodology}
      Historical Timeline: ${dto.historicalTimeline?.map((h) => `${h.monthYear}: ${h.description}`).join('\n') || 'Not provided'}
      Competitive Advantage Analysis: ${
        dto.competitiveAdvantageAnalysis
          ?.map(
            (c) =>
              `Competitor: ${c.competitorName}
         Offer: ${c.offer}
         Pricing Strategy: ${c.pricingStrategy}`,
          )
          .join('\n\n') || 'Not provided'
      }
      Intellectual Property Status: ${dto.intellectualPropertyStatus}

      Analyze the startup proposal and provide a concise three-sentence summary that covers:
      1. Overall viability assessment (market potential and solution strength)
      2. Key competitive advantages and growth strategy feasibility
      3. Critical risks and primary recommendations
      
      Important: 
      - Provide exactly three sentences
      - Start directly with the analysis, no introductory phrases
      - Be clear and direct about the startup's potential
      - Focus on the most impactful insights
      - Keep output concise while covering essential points`),
    });

    if (!res.text) {
      throw new Error('AI response did not contain any text');
    }

    return res.text.trim();
  }

  async generateRNAsFromPrompt(
    prompt: string,
  ): Promise<{ readiness_level_type: string; rna: string | null }[]> {
    return this.callAiExpectJson({
      prompt,
      schema: readinessRnaSchema,
      fallback: [],
      correctivePrompt:
        'The previous answer was invalid. Return only a JSON array where every item has readiness_level_type and rna fields as strings.',
    });
  }

  async generateTasksFromPrompt(
    prompt: string,
  ): Promise<{ target_level: number; description: string }[]> {
    const tasks = await this.callAiExpectJson({
      prompt,
      schema: readinessTaskSchema,
      fallback: [],
      correctivePrompt:
        'The previous answer was invalid. Return only a JSON array where every item has an integer target_level and a description string.',
    });

    // Normalize any numeric target_level fields using baseline
    const normalized = await Promise.all(
      tasks.map(async (t) => {
        try {
          const n = await this.baselineService.normalizeScore(Number(t.target_level));
          return { ...t, target_level_normalized: n.scaled, target_level_z: n.z };
        } catch (err) {
          return { ...t, target_level_normalized: t.target_level };
        }
      }),
    );
    return normalized as any;
  }

  async generateInitiativesFromPrompt(prompt: string): Promise<
    {
      description: string;
      measures: string;
      targets: string;
      remarks: string;
    }[]
  > {
    return this.callAiExpectJson({
      prompt,
      schema: readinessInitiativeSchema,
      fallback: [],
      correctivePrompt:
        'The previous answer was invalid. Return only a JSON array where every item has description, measures, targets, and remarks fields as strings.',
    });
  }

  async refineRnsDescription(
    prompt: string,
  ): Promise<{ refinedDescription: string; aiCommentary: string }> {
    const res = await this.ai.models.generateContent({
      model: this.modelName,
      contents: this.groundPrompt(prompt),
    });

    if (!res.text) {
      throw new Error('AI response did not contain any text');
    }

    const [refinedDescriptionRaw, aiCommentaryRaw] =
      res.text.split(/\n?={5,}\n?/);
    const refinedDescription = refinedDescriptionRaw
      ? refinedDescriptionRaw.trim()
      : '';
    const aiCommentary = aiCommentaryRaw ? aiCommentaryRaw.trim() : '';
    return {
      refinedDescription,
      aiCommentary,
    };
  }

  async generateRoadblocksFromPrompt(
    prompt: string,
  ): Promise<{ description: string; fix: string; riskNumber: number }[]> {
    const roadblocks = await this.callAiExpectJson({
      prompt,
      schema: readinessRoadblockSchema,
      fallback: [],
      correctivePrompt:
        'The previous answer was invalid. Return only a JSON array where every item has description and fix as strings and riskNumber as an integer.',
    });

    const normalized = await Promise.all(
      roadblocks.map(async (r) => {
        try {
          const n = await this.baselineService.normalizeScore(Number(r.riskNumber));
          return { ...r, riskNumber_normalized: n.scaled, riskNumber_z: n.z };
        } catch (err) {
          return { ...r, riskNumber_normalized: r.riskNumber };
        }
      }),
    );

    return normalized as any;
  }

  async createBasePrompt(
    startup: Startup,
    em: EntityManager,
  ): Promise<string | null> {
    const capsuleProposalInfo = startup.capsuleProposal;
    if (!capsuleProposalInfo) return null;

    const startupReadinessLevels = await em.find(
      StartupReadinessLevel,
      {
        startup: startup,
      },
      {
        populate: ['readinessLevel'],
      },
    );

    const trl = startupReadinessLevels[0]?.readinessLevel.level || 0;
    const mrl = startupReadinessLevels[1]?.readinessLevel.level || 0;
    const arl = startupReadinessLevels[2]?.readinessLevel.level || 0;
    const orl = startupReadinessLevels[3]?.readinessLevel.level || 0;
    const rrl = startupReadinessLevels[4]?.readinessLevel.level || 0;
    const irl = startupReadinessLevels[5]?.readinessLevel.level || 0;

    return `
      Given these data:
      Acceleration Proposal Title: ${capsuleProposalInfo.title}
      Duration: 3 months
      I. About the startup
      A. Startup Description
      ${capsuleProposalInfo.description}
      B. Problem Statement
      ${capsuleProposalInfo.problemStatement}
      C. Target Market
      ${capsuleProposalInfo.targetMarket}
      D. Solution Description
      ${capsuleProposalInfo.solutionDescription}
      II. About the Proposed Acceleration
      A. Objectives
      ${capsuleProposalInfo.objectives}
      B. Scope of The Proposal
      ${capsuleProposalInfo.scope}
      C. Methodology and Expected Outputs
      ${capsuleProposalInfo.methodology}
      Initial Readiness Level:
      TRL ${trl}
      MRL ${mrl}
      ARL ${arl}
      ORL ${orl}
      RRL ${rrl}
      IRL ${irl}
  `;
  }

  async refineInitiative(prompt: string): Promise<{
    refinedDescription?: string;
    refinedMeasures?: string;
    refinedTargets?: string;
    refinedRemarks?: string;
    aiCommentary: string;
  }> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: this.groundPrompt(prompt),
    });

    const content = response.text;
    if (!content) throw new Error('No content in response');

    const [jsonStr, commentary] = content
      .split('=========')
      .map((str) => str.trim());

    const cleanJsonStr = jsonStr.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const refinements = JSON.parse(cleanJsonStr);

      const hasRefinements =
        refinements.refinedDescription ||
        refinements.refinedMeasures ||
        refinements.refinedTargets ||
        refinements.refinedRemarks;

      if (!hasRefinements) {
        console.warn('AI response contained no refinements');
      }

      return {
        ...refinements,
        aiCommentary: commentary || 'Changes applied successfully.',
      };
    } catch (err) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', err);
      throw new Error('AI returned an invalid JSON response');
    }
  }

  async refineRoadblock(prompt: string): Promise<{
    refinedDescription?: string;
    refinedFix?: string;
    aiCommentary: string;
  }> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: this.groundPrompt(prompt),
    });

    const content = response.text;
    if (!content) throw new Error('No content in response');

    const [jsonStr, commentary] = content
      .split('=========')
      .map((str) => str.trim());
    const cleanJsonStr = jsonStr.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const refinements = JSON.parse(cleanJsonStr);

      const hasRefinements =
        refinements.refinedDescription || refinements.refinedFix;

      if (!hasRefinements) {
        console.warn('AI response contained no refinements');
      }

      return {
        ...refinements,
        aiCommentary: commentary || 'Changes applied successfully.',
      };
    } catch (err) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', err);
      throw new Error('AI returned an invalid JSON response');
    }
  }

  async refineRna(prompt: string): Promise<{
    refinedRna?: string;
    aiCommentary: string;
  }> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: this.groundPrompt(prompt),
    });

    const content = response.text;
    if (!content) throw new Error('No content in response');

    const [jsonStr, commentary] = content
      .split('=========')
      .map((str) => str.trim());
    const cleanJsonStr = jsonStr.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const refinements = JSON.parse(cleanJsonStr);

      const hasRefinements = refinements.refinedRna;

      if (!hasRefinements) {
        console.warn('AI response contained no refinements');
      }

      return {
        ...refinements,
        aiCommentary: commentary || 'Changes applied successfully.',
      };
    } catch (err) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', err);
      throw new Error('AI returned an invalid JSON response');
    }
  }
}
