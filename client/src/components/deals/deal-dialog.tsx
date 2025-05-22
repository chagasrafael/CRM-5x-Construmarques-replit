import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { DealStage, DealStatus, insertDealSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createDeal, updateDeal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { updateNegociacao, Negociacao } from "@/lib/n8nApiClient";
import { useUpdateNegociacao } from "@/hooks/use-update-negociacao";
import { getNomeCliente, getValorNegociado } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const dealFormSchema = insertDealSchema.extend({
  valorNegociado: z.coerce.number().min(1, "O valor deve ser maior que zero"),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: any; // Existing deal for editing
}

export default function DealDialog({ open, onOpenChange, deal }: DealDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!deal;

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      nomeCliente: getNomeCliente(deal || {}) || "",
      valorNegociado: getValorNegociado(deal || {}) || 0,
      estagio: deal?.estagio || DealStage.NOVO_CONTATO,
      status: deal?.status || DealStatus.EM_NEGOCIACAO,
      vendedor: deal?.vendedor || "",
    },
  });

  const createDealMutation = useMutation({
    // Modificamos a mutationFn para converter valorNegociado para string
    mutationFn: async (values: DealFormValues) => {
      const formattedValues = {
        ...values,
        valorNegociado: String(values.valorNegociado)
      };
      return createDeal(formattedValues as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      // Também invalidamos queries da API n8n
      queryClient.invalidateQueries({ queryKey: ['negociacoes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast({
        title: "Negociação criada",
        description: "A negociação foi criada com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar negociação",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async (values: DealFormValues) => {
      // Convertendo o valor para string antes de passar para a API local
      const formattedValues = {
        ...values,
        valorNegociado: String(values.valorNegociado)
      };
      return updateDeal(deal.id, formattedValues);
    },
    onSuccess: () => {
      // Invalidar queries da API local
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      // Também invalidamos queries da API n8n
      queryClient.invalidateQueries({ queryKey: ['negociacoes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      toast({
        title: "Negociação atualizada",
        description: "A negociação foi atualizada com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar negociação",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Hook personalizado para realizar a atualização com a API n8n
  const updateNegociacaoMutation = useUpdateNegociacao();

  const onSubmit = (values: DealFormValues) => {
    setIsSubmitting(true);
    
    if (isEditing) {
      // Prepara os dados para a API n8n, usando os nomes de campos esperados
      const n8nData = {
        ...values,
        // Mantém compatibilidade com ambos os formatos de nomeclatura de campos
        nomeCliente: values.nomeCliente,
        Nome_cliente: values.nomeCliente,
        valorNegociado: String(values.valorNegociado),
        valor_negociado: String(values.valorNegociado)
      };
      
      // Verifica se o negócio tem o campo createdAt (que só existe na API local)
      // Isso permite identificar a origem do negócio
      const isFromLocalApi = 'createdAt' in deal;
      
      // Tenta atualizar na API do n8n
      updateNegociacaoMutation.mutate({
        id: deal.id,
        data: n8nData
      }, {
        onSuccess: () => {
          // Se atualização na API n8n for bem-sucedida, 
          // não precisamos mostrar mensagens de erro da API local
          toast({
            title: "Negociação atualizada",
            description: "A negociação foi atualizada com sucesso."
          });
          setIsSubmitting(false);
          onOpenChange(false);
        },
        onError: (error) => {
          toast({
            title: "Erro ao atualizar negociação",
            description: error.message,
            variant: "destructive"
          });
          setIsSubmitting(false);
        }
      });
      
      // Somente atualiza localmente se o negócio for da API local
      if (isFromLocalApi) {
        updateDealMutation.mutate({
          ...values,
          // Forçando o tipo para satisfazer a API
          valorNegociado: String(values.valorNegociado) as any
        });
      }
    } else {
      // Para criar novos registros, usamos apenas a API local por enquanto
      createDealMutation.mutate({
        ...values,
        // Forçando o tipo para satisfazer a API
        valorNegociado: String(values.valorNegociado) as any
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Negociação" : "Nova Negociação"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da esquerda: Informações do cliente e detalhes da negociação */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nomeCliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valorNegociado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Negociado</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estagio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estágio</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estágio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DealStage).map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DealStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vendedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendedor</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
          
          {/* Coluna da direita: Resumo da conversa e link para o histórico */}
          <div className="space-y-4">
            {/* Seção para link da conversa */}
            {deal?.link_conversa && (
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center text-sm text-blue-800 font-medium mb-2">
                  <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
                  Histórico de conversas
                </div>
                <a 
                  href={deal.link_conversa} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                >
                  Acessar conversa com o cliente
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
            
            {/* Seção para resumo da conversa */}
            {deal?.resumo && (
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 h-[400px] overflow-y-auto">
                <div className="flex items-center text-sm text-gray-800 font-medium mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Resumo da conversa
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {deal.resumo}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
              ? "Salvar Alterações"
              : "Criar Negociação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
