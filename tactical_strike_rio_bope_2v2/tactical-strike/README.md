# Tactical Strike — Rio + BOPE + 2v2

## Rodar no computador
1. Instale o Node.js (versão 18 ou superior).
2. Abra um terminal na pasta deste projeto.
3. Execute `npm install` (requer internet na primeira instalação).
4. Execute `npm start`.
5. Abra http://localhost:3000 e aguarde o mapa carregar.
6. Clique em **TREINO COM BOTS** ou **2v2 ONLINE**.

Three.js é servido pelo próprio projeto, sem dependência de CDN durante a partida.
Não abra o HTML diretamente: use o servidor acima.

## Escolher suas músicas
No menu, em **Suas músicas (MP3)**, selecione um ou vários arquivos do computador.
A seleção substitui a lista anterior. Use a lista para escolher uma faixa ou os botões
Anterior/Próxima. A lista repete automaticamente quando termina.

Os MP3 ficam apenas na aba do navegador: não são enviados ao servidor ou aos outros
jogadores. A música continua ao entrar e sair da partida. Os controles de volume e
liga/desliga aparecem também no HUD. Aperte Esc para usar os botões durante o jogo.
Ao atualizar/fechar a página, selecione os arquivos novamente. **Limpar** libera a lista.
Arquivos inválidos mostram uma mensagem e permitem escolher outra faixa.
Nenhuma música comercial está incluída no projeto.

## Rio de Janeiro (cs_rio)
O Rio é o mapa padrão. No menu também é possível escolher Vila do Chaves. O ZIP inclui os personagens BOPE, armas, faca, música MP3 local e modo 2v2 por eliminação.

Mapa original de **Mataleone & Crocodilo**. Foram convertidos 16.153 triângulos, 20 pontos de nascimento (10 por equipe) e as seis faces do céu original. Os pontos foram ajustados ao chão; no 2v2, cada dupla começa em pontos próximos de sua equipe. Paredes e terreno têm colisão, e o servidor usa a geometria do mapa escolhido para bloquear tiros.

O arquivo enviado não contém os WADs halflife.wad, cstrike.wad, decals.wad e cs_bdog.wad. Sete texturas usadas foram reaproveitadas do mapa Chaves por nome exato; 66 texturas usadas receberam materiais substitutos. As texturas próprias do Rio que estavam embutidas foram preservadas. Lista em public/maps/rio/texturas.txt. Para uma reprodução visual completa, ainda seriam necessários os WADs originais.

Esta é uma conversão estática para o 2v2 do jogo: não executa a lógica original de resgate de reféns, portas interativas, objetos quebráveis ou os sons ambientes do CS. O modo continua sendo eliminação, sem Spike. Créditos e descrição recebidos estão junto do mapa.

Reprodução da conversão:
`python tools/convert_map.py caminho/cs_rio.bsp public/maps/rio public/maps/chaves`
Depois converta as seis TGA do céu em PNG na pasta public/maps/rio/sky/ e execute `node tools/settle_spawns.mjs rio`.

Validação: 20 pontos do Rio e 32 do Chaves com chão; treino no Rio; troca Rio/Chaves/Rio; quatro conexões numa partida no Rio; sala separada no Chaves; bloqueio de entrada com mapa diferente; início de combate sem erros de JavaScript ou arquivos HTTP ausentes.

## Mapa enviado: de_chaves3.0
Geometria, texturas embutidas, iluminação aproximada e 32 pontos de nascimento foram
convertidos do BSP enviado. O mapa está em `public/maps/chaves/` e pode ser escolhido no menu.
Crédito do mapa original, extraído de sua descrição: **Raul Cotrim de Mattos**, agosto de 2010,
CounterZone.com.br. Os créditos não representam uma nova licença do mapa.

A adaptação inclui colisão com o cenário, gravidade, degraus e pulo. Paredes bloqueiam
os tiros do jogador e os ataques dos bots. Não é uma execução da engine GoldSrc:
- Portas exportadas abertas e fixas.
- Objetos quebráveis ficam estáticos; água não possui natação/efeitos originais.
- Gatilhos, explosões e objetivo de bomba do mapa original não foram implementados.
- O RAR não contém as seis imagens do céu citadas no .res; há um céu simples de substituição.
- A iluminação é aproximada por vértices. Decalques da engine não foram importados.
- Bots usam movimentação simples, sem navegação avançada entre os cômodos.

## Controles
WASD: mover · Mouse: mirar · Clique: atirar · Shift: correr · Espaço: pular
R: recarregar · Esc: liberar cursor · MENU: voltar ao menu

## Jogar 2v2 com amigos
1. Os quatro abrem a mesma versão do jogo, selecionam **o mesmo mapa** e escolhem **2v2 ONLINE**.
2. Usem o mesmo código de sala. Outros códigos criam partidas separadas. Se a sala já usa outro mapa, o jogo informa qual selecionar.
3. Cada um clica em **PRONTO**. As equipes são distribuídas pela ordem de entrada: 1º/3º Alpha, 2º/4º Bravo.
4. Em cada round há 20 segundos de compra (tecla **B**), depois 90 segundos para eliminar a outra dupla.
5. Vence quem fizer 5 rounds. Sem eliminações completas até o tempo acabar, o round empata sem ponto.
6. Quem morre aguarda o próximo round, sem renascer imediatamente. Ao final, os quatro podem clicar em PRONTO para revanche.

Esta é uma adaptação curta por eliminação inspirada em jogos táticos. Não inclui Spike, habilidades ou assets de Valorant.
Cada round começa com pistola P-12 (12/48) e faca. O rifle VX-9 (30/90) custa 1.600 créditos e colete de 50 custa 400. Começa-se com 800 créditos; vitória rende 900, derrota/empate 700 e eliminação 200 (limite 5.000). Equipamentos são reiniciados em **todos** os rounds, inclusive para sobreviventes; créditos permanecem. Primeiro round de pistolas.

**1** equipa rifle comprado, **2** pistola, **3** faca. Segure o clique para disparar o rifle. Pistola e faca usam cliques individuais. **R** recarrega. **TAB** mostra jogadores e eliminações/mortes. **Esc** libera o cursor para os botões.
Faca causa 55 de dano e só alcança 2,2 metros. Rifles causam 34; pistolas 28. Tiros na cabeça multiplicam o dano por 3. Colete absorve metade do dano até esgotar. Sem fogo amigo. Paredes bloqueiam tiros.

O servidor controla vida, dano, munição, dinheiro, compras, recargas, pontuação e rounds. Movimento possui validação básica de velocidade; colisão de movimento roda no cliente, sem anticheat completo nem compensação de latência. Ataques usam posições atuais e caixas simples de acerto. Modelos remotos mostram rifle, pistola ou faca conforme a arma equipada; as armas em terceira pessoa são modelos simples próprios. O treino com bots continua separado dos rounds online.

Sala tem no máximo quatro jogadores. Se alguém desconectar, a partida volta à espera; com quatro novamente, todos devem marcar PRONTO e uma nova partida começa. Estado fica na memória: reiniciar ou suspender o servidor encerra as salas. Não há progresso persistente.

## Atualizar o projeto no Render
Extraia o ZIP e envie o conteúdo da pasta tactical-strike ao repositório usado pelo Render, substituindo os arquivos da versão anterior. Envie também public/maps/rio/, public/models/bope/, match.js e public/weapons.js. package.json e server.js precisam estar na pasta que o Render usa como raiz. Comandos continuam: npm install e npm start. Depois de publicar, todos devem recarregar a página para usar a mesma versão.
Não basta trocar apenas index.html: o novo combate precisa do novo servidor.

Deixe o campo Servidor online vazio para usar o servidor atual. Hospedagem precisa aceitar Node.js e WebSockets. PORT configura a porta. Use uma única instância: salas não são compartilhadas entre servidores.

## Estrutura
- `server.js`: Express + Socket.IO.
- `public/index.html`: jogo, carregamento do mapa e seleção de músicas.
- `public/maps/chaves/`: mapa convertido e texturas PNG.
- `tools/convert_map.py`: conversor usado (Python + Pillow), para reprodução técnica.

Conversor: `python tools/convert_map.py caminho/de_chaves3.bsp public/maps/chaves`
Referência de formato: https://github.com/ValveSoftware/halflife/blob/master/utils/common/bspfile.h

## Verificações
`npm test`: regras de compra, quatro vagas, equilíbrio das equipes, prontidão, dano, recarga, proteção por paredes, alcance de faca, ausência de fogo amigo, eliminação, rounds, vitória, revanche, timeout e desconexão.
Teste de integração em Chromium: carregamento do mapa, treino, troca de arma/faca, quatro conexões na mesma sala, uma sala isolada, compra de colete, início de combate e retorno à espera após desconexão. Sem erros JavaScript nesses testes. Não substitui teste de latência com quatro computadores pela internet.
Para repetir o teste de colisão dos 52 pontos de nascimento dos dois mapas: `npm run test:map`.

## Personagens BOPE enviados
Os quatro modelos do arquivo bope_cs.rar (GIGN, GSG9, SAS e URBAN) foram convertidos do formato MDL do CS 1.6, preservando geometria, texturas e esqueleto. Cada personagem tem 839 triângulos e 50 ossos, com altura ajustada para 1,80 m no jogo. Animações de caminhada/corrida e poses de rifle, pistola e faca usam os dados enviados.

Bots e jogadores online usam os personagens BOPE. Cada jogador recebe uma das quatro variantes pela ordem de entrada. Um marcador laranja ou azul acima do personagem identifica sua equipe. O modelo em primeira pessoa continua sendo a arma e as mãos da versão 2v2; a skin aparece nos outros jogadores e nos bots.

Galeria: /personagens.html. Assets: public/models/bope/. Conversor: tools/convert_mdl.py (Python + Pillow). Origem do pacote enviado: CounterZone.com.br; o material recebido não identifica individualmente o autor da skin. Os modelos não foram criados por nós. A atribuição original está em public/models/bope/origem.txt.

Verificação no Chromium: quatro variantes texturizadas, poses de arma, caminhada e corrida com coordenadas finitas; entrada no treino e sala 2v2. Mapa cs_rio integrado; de_chaves3.0 continua disponível no seletor.
