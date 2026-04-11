import { useMutation } from '@tanstack/react-query'
import { login, logout, register } from '../lib/api'

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
  })
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
  })
}
