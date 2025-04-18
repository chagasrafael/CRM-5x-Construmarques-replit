import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNegociacao } from "@/lib/n8nApiClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook customizado para atualizar negociações na API do n8n.
 * Utiliza TanStack Query para gerenciar estado da mutação.
 */
export function useUpdateNegociacao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      return updateNegociacao(id, data);
    },
    onSuccess: () => {
      // Invalidar as queries para atualizar os dados automáticamente
      queryClient.invalidateQueries({ queryKey: ['negociacoes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      
      toast({
        title: "Negociação atualizada",
        description: "A negociação foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar negociação",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}