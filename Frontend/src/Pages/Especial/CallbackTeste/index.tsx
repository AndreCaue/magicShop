// src/pages/Callback.jsx   (ou .tsx)
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // Vite + React Router v6
// Se você usa Next.js, troque por useRouter + useSearchParams do next/navigation

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  //https://sandbox.melhorenvio.com.br/oauth/authorize?client_id=7611&redirect_uri=https%3A%2F%2Fzinky-caroll-unflurried.ngrok-free.dev%2Fcallback&response_type=code&scope=shipping-calculate%20shipping-checkout%20shipping-generate%20shipping-tracking
  useEffect(() => {
    // Caso tenha dado erro no OAuth
    if (error) {
      alert(`Erro na autorização: ${error}`);
      navigate("/");
      return;
    }

    // Se chegou aqui com o code → troca por token
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
                client_id: "7611", // ← seu client_id
                client_secret: "v5xsIXbTd0yzIN8OetRBnlUWRT6TlsxGz4wfBawJ", // ← cole aqui (nunca commit no git!)
                code: code,
                redirect_uri:
                  "https://zinky-caroll-unflurried.ngrok-free.dev/callback", // ← exatamente o mesmo do painel
              }),
            }
          );

          const data = await response.json();

          if (data.access_token) {
            // Salva os tokens (você pode usar zustand, context ou localStorage)
            localStorage.setItem("me_access_token", data.access_token); // parei aqui (grok)
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
