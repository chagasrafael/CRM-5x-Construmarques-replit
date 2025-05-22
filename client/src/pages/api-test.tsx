import { useState, useEffect } from "react";
import { fetchNegociacoes } from "@/lib/n8nApiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiTest() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNegociacoes();
      setApiData(data);
      console.log("API Response:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Contagem de estágios e status para diagnóstico
  const getStatusStats = () => {
    if (!apiData || !Array.isArray(apiData)) return {};

    const stages = {};
    const statuses = {};

    apiData.forEach(item => {
      // Contar estágios
      if (item.estagio) {
        stages[item.estagio] = (stages[item.estagio] || 0) + 1;
      }

      // Contar status
      if (item.status) {
        statuses[item.status] = (statuses[item.status] || 0) + 1;
      }
    });

    return { stages, statuses };
  };

  const stats = getStatusStats();

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Teste de Conexão com API</CardTitle>
          <CardDescription>
            Clique no botão para testar a conexão com a API do n8n
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testApi} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? "Carregando..." : "Testar API"}
          </Button>

          {error && (
            <div className="my-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
              Erro: {error}
            </div>
          )}

          {apiData && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Estágios Encontrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {Object.entries(stats.stages || {}).map(([stage, count]) => (
                        <li key={stage} className="text-sm flex justify-between">
                          <span>{stage}</span>
                          <span className="font-medium">{count as number}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Status Encontrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {Object.entries(stats.statuses || {}).map(([status, count]) => (
                        <li key={status} className="text-sm flex justify-between">
                          <span>{status}</span>
                          <span className="font-medium">{count as number}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <h3 className="font-medium mb-2">Exemplo de Item:</h3>
              {Array.isArray(apiData) && apiData.length > 0 ? (
                <pre className="bg-gray-50 p-4 rounded border text-xs overflow-auto max-h-96">
                  {JSON.stringify(apiData[0], null, 2)}
                </pre>
              ) : (
                <p>Nenhum dado encontrado</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}