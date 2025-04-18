import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { DealStage, DealStatus, insertDealSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createDeal, updateDeal } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { updateNegociacao } from "@/lib/n8nApiClient";
import { useUpdateNegociacao } from "@/hooks/use-update-negociacao";

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
      nomeCliente: deal?.nomeCliente || "",
      valorNegociado: deal?.valorNegociado || 0,
      estagio: deal?.estagio || DealStage.NOVO_LEAD,
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
      // Prepara os dados para a API n8n
      const n8nData = {
        ...values,
        valorNegociado: String(values.valorNegociado)
      };
      
      // Tenta atualizar na API do n8n
      updateNegociacaoMutation.mutate({
        id: deal.id,
        data: n8nData
      });
      
      // Como fallback, atualiza localmente
      updateDealMutation.mutate({
        ...values,
        // Forçando o tipo para satisfazer a API
        valorNegociado: String(values.valorNegociado) as any
      });
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Negociação" : "Nova Negociação"}
          </DialogTitle>
        </DialogHeader>
        
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
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : isEditing
                  ? "Salvar Alterações"
                  : "Criar Negociação"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
