import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface NutritionAnalysisResult {
  title: string;
  calories: number;
  portion: string;
  proteinG: number;
  carbG: number;
  fatG: number;
  waterMl: number;
  confidenceScore: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      this.logger.warn(
        'GEMINI_API_KEY is not configured. AI nutrition analysis will return mock data.',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey ?? '');
  }

  async analyzeNutrition(text: string): Promise<NutritionAnalysisResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      this.logger.warn('Gemini API key not set, returning mock analysis');
      return this.getMockAnalysis(text);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `You are an expert pediatric nutritionist specializing in Indonesian children's food.
Analyze the given food description and estimate its nutritional content.
Output your response STRICTLY as a single JSON object with these exact fields:
- title (string): standardized Indonesian food name
- calories (integer): estimated total calories in kcal
- portion (string): estimated portion size (e.g., "1 porsi", "1 mangkok kecil")
- proteinG (number): protein in grams
- carbG (number): carbohydrates in grams
- fatG (number): fat in grams
- waterMl (integer): estimated water content in ml
- confidenceScore (number): your confidence level between 0.0 and 1.0

Use standard Indonesian portion sizes for estimation. Do NOT include any text outside the JSON object.`,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(text);
      const response = result.response;
      const responseText = response.text();

      const parsed = JSON.parse(responseText) as NutritionAnalysisResult;

      // Validate required fields
      if (
        typeof parsed.title !== 'string' ||
        typeof parsed.calories !== 'number' ||
        typeof parsed.proteinG !== 'number' ||
        typeof parsed.carbG !== 'number' ||
        typeof parsed.fatG !== 'number'
      ) {
        this.logger.warn('Gemini returned invalid structure, using fallback');
        return this.getMockAnalysis(text);
      }

      return parsed;
    } catch (error) {
      this.logger.error(
        `Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getMockAnalysis(text);
    }
  }

  private getMockAnalysis(text: string): NutritionAnalysisResult {
    return {
      title: text.substring(0, 100),
      calories: 150,
      portion: '1 porsi',
      proteinG: 8.0,
      carbG: 20.0,
      fatG: 5.0,
      waterMl: 80,
      confidenceScore: 0.5,
    };
  }
}
