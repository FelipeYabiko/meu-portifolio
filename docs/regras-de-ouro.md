# Regras de ouro

Leia inteiro antes de toda mudança e antes de entregar. Cada regra vem de um erro que já custou caro em algum
projeto. Ao fechar uma mudança, acrescente aqui o que valer para todas as próximas (uma linha, com o porquê).

## Todo projeto

1. **A ficha manda.** Só o que está na `FICHA.md`. Fazer a mais parece ajuda, mas cria coisa que ninguém pediu,
   ninguém testou e alguém vai ter de manter.
2. **Pequeno e funcionando.** Uma mudança por conversa, e ela termina com o projeto rodando. Projeto quebrado "por
   enquanto" vira projeto abandonado.
3. **Mexa só no necessário.** Não reorganize, não renomeie e não "melhore" o que não foi pedido: cada linha mexida é
   uma chance de quebrar o que funcionava.
4. **Teste antes do código** em toda regra da ficha e em todo conserto: primeiro o teste que falha, depois o código
   que faz passar. Conserto sem teste volta.
5. **Prove e diga os negativos.** Antes de dizer "pronto": verificar sem erro, telas olhadas, e a lista do que não
   ficou bom ou não foi testado. O dono decide melhor sabendo o que falta.
6. **Olhe o resultado, não o código.** Abra a tela, rode o comando, leia o arquivo gerado como o dono vai ver. O
   fiscal não vê beleza nem bom senso.
7. **Sem dependência nova sem o OK.** Cada pacote é algo que pode quebrar, sumir ou ser atacado. Tente com o que o
   Node e o navegador já trazem.
8. **Dados e segredos do dono são sagrados.** `dados/` e `.env` nunca vão para o git, nunca são apagados e nunca
   aparecem na conversa.
9. **Funciona no Windows.** Sem nomes que só mudam em maiúscula, sem caracteres especiais em nome de arquivo, e os
   atalhos `.bat` testados no papel (o dono abre com dois cliques).
10. **Texto de gente.** Tudo o que o dono ou o usuário lê é português simples, direto, sem jargão e sem inglês
    desnecessário. Mensagem de erro diz o que aconteceu e o que fazer.
11. **Erro corrigido duas vezes vira regra do fiscal.** O que está só em texto é esquecido na conversa seguinte.


## Aprendido neste projeto

(As lições das mudanças entram aqui, a mais nova em cima.)
