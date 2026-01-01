import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsRepository, type HabitsResponse, type UpsertHabitsRequest } from '@/repositories/habits.repository';
import type { HabitCategory } from '@/repositories/habits.repository';

export function useGetHabitsQuery() {
  return useQuery({
    queryKey: ['habits', 'get'],
    queryFn: () => habitsRepository.get(),
  });
}

function createOptimisticHabitsResponse(
  previousData: HabitsResponse | undefined,
  request: UpsertHabitsRequest
): HabitsResponse {
  if (!previousData) {
    return { categories: [] };
  }

  const existingCategoriesMap = new Map(
    previousData.categories.map((cat) => [cat.id, cat])
  );
  const existingElementsMap = new Map<number, Map<number, typeof previousData.categories[0]['elements'][0]>>();
  
  previousData.categories.forEach((cat) => {
    const elementsMap = new Map(cat.elements.map((elem) => [elem.id, elem]));
    existingElementsMap.set(cat.id, elementsMap);
  });

  let tempIdCounter = -1;
  const getTempId = () => tempIdCounter--;

  const optimisticCategories: HabitCategory[] = request.categories.map((reqCat) => {
    const existingCat = reqCat.id ? existingCategoriesMap.get(reqCat.id) : null;
    
    const categoryId = reqCat.id ?? getTempId();
    const now = new Date().toISOString();
    const nowTimestamp = Date.now();

    const optimisticElements = reqCat.elements.map((reqElem) => {
      const existingElem = reqElem.id && existingCat
        ? existingElementsMap.get(reqCat.id!)?.get(reqElem.id)
        : null;

      const elementId = reqElem.id ?? getTempId();

      return {
        id: elementId,
        category_id: categoryId,
        name: reqElem.name,
        icon_name: reqElem.iconName ?? null,
        created_at: existingElem?.created_at ?? now,
        updated_at: now,
        created_at_timestamp_ms: existingElem?.created_at_timestamp_ms ?? nowTimestamp,
        updated_at_timestamp_ms: nowTimestamp,
      };
    });

    return {
      id: categoryId,
      name: reqCat.name,
      user_id: existingCat?.user_id ?? '',
      created_at: existingCat?.created_at ?? now,
      updated_at: now,
      created_at_timestamp_ms: existingCat?.created_at_timestamp_ms ?? nowTimestamp,
      updated_at_timestamp_ms: nowTimestamp,
      elements: optimisticElements,
    };
  });

  return {
    categories: optimisticCategories,
  };
}

export function useUpsertHabitsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: UpsertHabitsRequest) => habitsRepository.upsert(args),
    onMutate: async (variables) => {
      const queryKey = ['habits', 'get'];
      
      await queryClient.cancelQueries({ queryKey });

      const previousHabitsData = queryClient.getQueryData<HabitsResponse>(queryKey);

      const optimisticData = createOptimisticHabitsResponse(previousHabitsData, variables);

      queryClient.setQueryData<HabitsResponse>(queryKey, optimisticData);

      return { previousHabitsData };
    },
    onError: (error, variables, context) => {
      if (context?.previousHabitsData) {
        queryClient.setQueryData(['habits', 'get'], context.previousHabitsData);
      }
    },
    onSuccess: (data: HabitsResponse) => {
      queryClient.setQueryData(['habits', 'get'], data);
    },
  });
}
