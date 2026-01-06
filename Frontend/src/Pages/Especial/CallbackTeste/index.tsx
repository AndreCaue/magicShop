import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  useEffect(() => {
    if (error) {
      alert(`Erro na autorização: ${error}`);
      navigate("/");
      return;
    }

    if (code) {
      const trocarCodePorToken = async () => {
        try {
          const response = await fetch(
            "https://api.melhorenvio.com.br/v2/oauth/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: "7611",
                client_secret: "v5xsIXbTd0yzIN8OetRBnlUWRT6TlsxGz4wfBawJ",
                code: code,
                redirect_uri:
                  "https://zinky-caroll-unflurried.ngrok-free.dev/callback",
              }),
            }
          );

          const data = await response.json();

          if (data.access_token) {
            localStorage.setItem("me_access_token", data.access_token);
            localStorage.setItem("me_refresh_token", data.refresh_token || "");
            localStorage.setItem(
              "me_token_expires",
              (Date.now() + data.expires_in * 1000).toString()
            );

            alert("Autorização concluída com sucesso! Tokens salvos.");
            navigate("/checkout"); // ou "/" ou "/frete"
          } else {
            console.error("Erro na resposta:", data);
            alert(
              "Falha ao obter token: " + (data.error_description || data.error)
            );
          }
        } catch (err) {
          console.error(err);
          alert("Erro de rede. Tente novamente.");
        }
      };

      trocarCodePorToken();
    }
  }, [code, error, navigate]);

  return (
    <div
      style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h2>Autorizando com Melhor Envio...</h2>
      <p>Não feche esta página.</p>
      <div>Processando código de autorização...</div>
    </div>
  );
}
