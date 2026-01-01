import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scoresRepository } from '@/repositories/scores.repository';
import type { DailyScore } from '@/types';

export function useListScoresQuery(args: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['scores', 'list', args.startDate, args.endDate],
    queryFn: () => scoresRepository.list(args),
  });
}

export function useGetScoreQuery(args: { dateZts: string }) {
  return useQuery({
    queryKey: ['scores', 'get', args.dateZts],
    queryFn: () => scoresRepository.getByDate(args),
    enabled: !!args.dateZts,
  });
}

export function useCreateScoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { dateZts: string; score: number }) => scoresRepository.create(args),
    onSuccess: (data: DailyScore) => {
      queryClient.invalidateQueries({ queryKey: ['scores', 'get', data.date_zts] });
      queryClient.invalidateQueries({ queryKey: ['scores', 'list'] });
    },
  });
}

export function useDeleteScoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { dateZts: string }) => scoresRepository.delete(args),
    onSuccess: (_, variables: { dateZts: string }) => {
      queryClient.invalidateQueries({ queryKey: ['scores', 'get', variables.dateZts] });
      queryClient.invalidateQueries({ queryKey: ['scores', 'list'] });
    },
  });
}
