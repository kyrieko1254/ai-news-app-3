import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const CLASSIFY_SCHEMA = {
  type: 'object',
  properties: {
    title_ko: { type: 'string', description: '기사 제목의 자연스러운 한국어 번역' },
    summary_ko: { type: 'string', description: '기사 내용을 요약한 2~3문장의 한국어 요약' },
    category: { type: 'string', description: '기사에 가장 적합한 카테고리명. 기존 카테고리 중 적절한 것이 있으면 그것을 사용하고, 없으면 새로운 카테고리명을 제안' },
  },
  required: ['title_ko', 'summary_ko', 'category'],
  additionalProperties: false,
} as const;

type ClassifyResult = {
  titleKo: string;
  summaryKo: string;
  category: string;
};

type ClassifyApiResponse = {
  title_ko: string;
  summary_ko: string;
  category: string;
};

// 기사 제목/본문을 클로드 API로 번역/요약하고 카테고리를 분류. 실패 시 null 반환(호출부에서 스킵 처리)
export async function classifyArticle(input: {
  title: string;
  content: string;
  existingCategories: string[];
}): Promise<ClassifyResult | null> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: `당신은 해외 AI 뉴스를 한국어 사용자에게 소개하는 어시스턴트입니다.
기존 카테고리 목록: ${input.existingCategories.length > 0 ? input.existingCategories.join(', ') : '(없음)'}
카테고리를 고를 때는 가능하면 기존 카테고리 중에서 선택하고, 적절한 것이 없을 때만 새 카테고리명을 제안하세요.`,
      output_config: {
        format: { type: 'json_schema', schema: CLASSIFY_SCHEMA },
      },
      messages: [
        {
          role: 'user',
          content: `다음 기사를 번역/요약/분류해주세요.\n\n제목: ${input.title}\n\n본문: ${input.content}`,
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      return null;
    }

    const block = response.content.find((b) => b.type === 'text');
    if (!block || block.type !== 'text') return null;

    const parsed = JSON.parse(block.text) as ClassifyApiResponse;
    if (!parsed.title_ko || !parsed.summary_ko || !parsed.category) return null;

    return {
      titleKo: parsed.title_ko,
      summaryKo: parsed.summary_ko,
      category: parsed.category,
    };
  } catch {
    return null;
  }
}
