import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { completionsRepository } from '@/repositories/completions.repository';
import type { DailyCompletion } from '@/types';

export function useListCompletionsQuery(args: { elementId: number; dateZts?: string }) {
  return useQuery({
    queryKey: ['completions', 'list', args.elementId, args.dateZts],
    queryFn: () => completionsRepository.list(args),
    enabled: !!args.elementId,
  });
}

export function useCreateCompletionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { elementId: number; dateZts: string }) =>
      completionsRepository.create(args),
    onSuccess: (data: DailyCompletion, variables: { elementId: number; dateZts: string }) => {
      queryClient.invalidateQueries({
        queryKey: ['completions', 'list', variables.elementId, variables.dateZts],
      });
      queryClient.invalidateQueries({ queryKey: ['completions', 'list', variables.elementId] });
    },
  });
}

export function useDeleteCompletionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { elementId: number; dateZts: string }) =>
      completionsRepository.delete(args),
    onSuccess: (_, variables: { elementId: number; dateZts: string }) => {
      queryClient.invalidateQueries({
        queryKey: ['completions', 'list', variables.elementId, variables.dateZts],
      });
      queryClient.invalidateQueries({ queryKey: ['completions', 'list', variables.elementId] });
    },
  });
}
