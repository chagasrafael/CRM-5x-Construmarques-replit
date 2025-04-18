import { FileText } from "lucide-react";

export default function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 text-neutral-400 border border-dashed border-neutral-300 rounded-md">
      <FileText className="h-12 w-12 mb-2" />
      <p className="text-sm font-medium">Sem negociações neste estágio</p>
      <p className="text-xs mt-1">Arraste negociações para esta coluna</p>
    </div>
  );
}
