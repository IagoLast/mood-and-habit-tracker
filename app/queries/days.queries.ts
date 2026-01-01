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
    onMutate: async (variables) => {
      const queryKey = ['days', 'get', variables.date];
      
      await queryClient.cancelQueries({ queryKey });

      const previousDayData = queryClient.getQueryData<DayData>(queryKey);

      if (previousDayData) {
        const optimisticData: DayData = {
          ...previousDayData,
          ...(variables.data.score !== undefined && { score: variables.data.score }),
          categories: previousDayData.categories.map((category) => ({
            ...category,
            elements: category.elements.map((element) => {
              const updateElement = variables.data.elements.find(
                (e) => e.elementId === element.id
              );
              if (updateElement) {
                return {
                  ...element,
                  completed: updateElement.completed === 'COMPLETED',
                };
              }
              return element;
            }),
          })),
        };

        queryClient.setQueryData<DayData>(queryKey, optimisticData);
      }

      return { previousDayData };
    },
    onError: (error, variables, context) => {
      if (context?.previousDayData) {
        queryClient.setQueryData(['days', 'get', variables.date], context.previousDayData);
      }
    },
    onSuccess: (data: DayData, variables: { date: string; data: UpdateDayRequest }) => {
      queryClient.setQueryData(['days', 'get', variables.date], data);
      queryClient.invalidateQueries({ queryKey: ['days', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['scores'] });
    },
  });
}
