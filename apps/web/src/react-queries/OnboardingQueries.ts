import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { createUser , fetchAllUser, updateUser } from "../services/user.service"
import { getResumes } from "../services/resume.service"


const onboardingMutations = {
  createUser: (options = {}) => ({
    mutationFn: createUser,
    ...options,
  }),
  updateUser: (options = {}) => ({
    mutationFn: updateUser,
    ...options,
  }),
}

const onboardingUseQuery = {
    fetchAllUsers: (options = {}) => ({
      queryKey: ['fetch-users'],
      queryFn: fetchAllUser,
      ...options
    }),
    getActiveResume: (options = {}) => ({
      queryKey: ['fetch-active-resume'],
      queryFn: () => getResumes(true),
      ...options
  }),
}

const onboardingUseInfiniteQuery = {
    fetchAllUsersInfinite: (limit: number, search: string, options = {}) => ({
      queryKey: ['fetch-users-infinite', search],
      queryFn: ({ pageParam = 0 }) => fetchAllUser({ offset: pageParam, limit, search }),
      getNextPageParam: (lastPage: any, allPages: any) => {
        const nextOffset = allPages.length * limit;
        if (nextOffset < lastPage.total) {
          return nextOffset;
        }
        return undefined;
      },
      initialPageParam: 0,
      ...options
    }),
}

export const onboardingCreateUser = () => {
  return useMutation(onboardingMutations.createUser(
    {
      onSuccess: () => {
        console.log("User created successfully")
      },
      onError: () => {
        console.log("User creation failed ")
      }
    })
  )
}

export const onboardingUpdateUser = () => {
  return useMutation(onboardingMutations.updateUser(
    {
      onSuccess: () => {
        console.log("User updated successfully")
      },
      onError: () => {
        console.log("User updation failed ")
      }
    })
  )
}

export const onboardingfetchAllUsers = () => {
    return useQuery(onboardingUseQuery.fetchAllUsers())
  }

export const onboardingFetchAllUsersInfinite = (search = "", limit = 10) => {
    return useInfiniteQuery(onboardingUseInfiniteQuery.fetchAllUsersInfinite(limit, search))
}

export const onboardingFetchActiveResume = () => {
  return useQuery(onboardingUseQuery.getActiveResume())
} 