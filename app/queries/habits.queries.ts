import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsRepository, type HabitsResponse, type UpsertHabitsRequest } from '@/repositories/habits.repository';

export function useGetHabitsQuery() {
  return useQuery({
    queryKey: ['habits', 'get'],
    queryFn: () => habitsRepository.get(),
  });
}

export function useUpsertHabitsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: UpsertHabitsRequest) => habitsRepository.upsert(args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', 'get'] });
    },
  });
}
