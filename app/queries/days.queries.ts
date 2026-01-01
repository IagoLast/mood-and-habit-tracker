import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { daysRepository, type UpdateDayRequest } from '@/repositories/days.repository';
import type { DayData } from '@/repositories/days.repository';

export function useGetDayQuery(args: { date: string }) {
  return useQuery({
    queryKey: ['days', 'get', args.date],
    queryFn: () => daysRepository.getByDate(args),
    enabled: !!args.date,
  });
}

export function useUpdateDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { date: string; data: UpdateDayRequest }) =>
      daysRepository.update(args),
    onSuccess: (data: DayData, variables: { date: string; data: UpdateDayRequest }) => {
      queryClient.invalidateQueries({ queryKey: ['days', 'get', variables.date] });
      queryClient.invalidateQueries({ queryKey: ['days', 'list'] });
    },
  });
}
