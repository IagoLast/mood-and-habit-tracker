import { useQuery } from '@tanstack/react-query';
import { scoresRepository } from '@/repositories/scores.repository';
import type { ScoreEntry } from '@/types';

interface ListScoresQueryArgs {
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

export function useListScoresQuery(args: ListScoresQueryArgs) {
  return useQuery<ScoreEntry[], Error>({
    queryKey: ['scores', 'list', args.startDate, args.endDate],
    queryFn: () => scoresRepository.list(args),
    enabled: args.enabled !== false,
  });
}
