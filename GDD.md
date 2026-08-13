# COURIER.EXE - Game Design Document

## Visão Geral

**Courier.exe** é um jogo 2D multiplayer competitivo de ação e raciocínio, ambientado em uma cidade controlada por grandes corporações.

De 2 a 4 jogadores assumem o papel de **Couriers**, invasores responsáveis por encontrar e roubar um **Data Core** protegido por criptografia.

O jogador precisa encontrar um terminal, resolver uma criptografia simples e roubar o Data Core.

A partir desse momento, começa uma perseguição: o jogador que já obter o Data Core precisa chegar ao **Extraction Point**.

O jogo foi projetado para partidas rápidas e competitivas em uma **feira de jogos**, onde os vencedores recebem **tijolinhos**, a moeda utilizada para trocar por recompensas.

## Gênero

* Ação
* Arcade
* Puzzle
* Multiplayer
* Cyberpunk

## Plataforma

* PC
* Navegador

## Tecnologia

* **Engine:** Phaser 3.90.0
* **Linguagem:** TypeScript
* **Build:** Vite
* **Editor:** Visual Studio Code
* **Versionamento:** Git + GitHub
* **Multiplayer:** WebSocket / Colyseus

# Universo

## Contexto

Grandes corporações controlam uma enorme rede digital e protegem informações valiosas através de sistemas de segurança e criptografia.

Os **Couriers** são invasores que trabalham transportando informações ilegais através dessa rede.

O jogador precisa invadir o sistema, roubar os dados e entrega-los antes de ser interceptado.

## Referências

### Filmes

* TRON (1982)
* TRON: O Legado (2010)
* TRON: Ares (2025)

### Jogos

* TRON Light Cycles
* Neon White
* Hotline Miami
* Mirror's Edge

## Estilo

* Cyberpunk
* Synthwave
* Neon
* Tecnologia futurista
* Ambientes digitais
* Fundo escuro
* Alto contraste

# Personagens

## Courier

Todos os jogadores controlam o mesmo tipo de personagem.

Não existem habilidades ou atributos exclusivos.

O diferencial visual é a cor escolhida antes da partida.

### Cores

* Rosa
* Laranja
* Branco
* Ciano

Cada jogador utiliza uma cor diferente.

# Mapa

## Estrutura

O jogo utiliza uma arena **2D Top-Down** representando uma área da cidade.

O mapa possui:

* Corredores
* Prédios
* Áreas abertas
* Atalhos
* Obstáculos
* Terminais
* Data Lanes
* Pontos de Spawn
* Extraction Point

O mapa deve possuir múltiplas rotas para permitir perseguições e estratégias diferentes.

# Gameplay

## Fluxo da Partida

```text
Lobby
↓
Escolha da cor
↓
Countdown
↓
Exploração
↓
Encontrar o Terminal
↓
Resolver a Criptografia
↓
Obter o Data Core
↓
Fuga
↓
Extração
↓
Vitória
↓
Recompensa
```

## Exploração

Todos os jogadores começam em pontos diferentes do mapa.

Após o countdown, precisam procurar o terminal que contém o Data Core.

O objetivo inicial é:

> **FIND THE TERMINAL**

## Crypto Break

Ao encontrar o terminal, o jogador precisa resolver uma criptografia simples.

Os desafios podem utilizar:

* Sequências numéricas
* Códigos
* Símbolos
* Padrões

Caso o jogador erre, pode tentar novamente.

Enquanto isso, outros jogadores podem chegar a outros terminais e resolverem outras criptogrias.

## Data Core

O jogador que resolver corretamente a criptografia obtém o Data Core.

A partir desse momento:

> **DATA CORE STOLEN**

O objetivo do portador passa a ser chegar ao Extraction Point.

## Perseguição

Os jogadores podem utilizar:

* Rotas alternativas
* Atalhos
* Data Lanes
* Dash
* Antecipação de movimento

O Data Core pode ser perdido caso o portador seja interceptado.

## Extraction Point

Após o Data Core ser obtido, um Extraction Point aparece no mapa.

O portador precisa chegar até ele e permanecer na área durante uma pequena contagem.

Ao concluir:

> **DATA DELIVERED**

O jogador vence a partida.

# Movimentação

O Courier possui movimentação rápida em quatro direções.

### Controles

* **WASD:** Movimento
* **Setas:** Movimento alternativo
* **Espaço:** Dash

## Dash

O Dash permite realizar um deslocamento rápido.

Pode ser utilizado para:

* Escapar de perseguidores
* Alcançar atalhos
* Evitar colisões
* Criar distância

Possui cooldown para evitar uso constante.

# Data Lanes

As **Data Lanes** são corredores especiais que aumentam temporariamente a velocidade do Courier.

Podem possuir limitações de movimentação.

Isso cria uma escolha entre:

**Velocidade x Segurança**

Uma rota rápida pode ser previsível e facilitar a interceptação pelos robôs seguranças da rede.

# Multiplayer

## Jogadores

* Mínimo: **2**
* Máximo: **4**

Todos participam da mesma partida simultaneamente.

## Sincronização

O multiplayer deve sincronizar:

* Posição
* Movimento
* Cor
* Dash
* Terminal
* Crypto Break
* Data Core
* Interceptação
* Extraction Point
* Estado da partida

## Arquitetura

```text
Cliente
   ↓
Servidor
   ↓
Clientes
```

O servidor mantém o estado oficial da partida.

# Duração

As partidas devem durar aproximadamente:

**5 minutos**

O jogo precisa ser rápido o suficiente para permitir que vários visitantes joguem durante a feira.

# Vitória

O jogador vence ao concluir a extração do Data Core e entrega-lá ao Extration ponte.

Não existem vantagens permanentes entre jogadores.

A vitória depende de:

* Reflexo
* Raciocínio
* Estratégia
* Conhecimento do mapa

# Recompensas

A feira utiliza **tijolinhos** como moeda para trocar por recompensas.

| Resultado    | Tijolinhos |
| ------------ | ---------: |
| 1º lugar     |   **5 🧱** |
| 2º lugar     |   **3 🧱** |
| 3º lugar     |   **2 🧱** |
| Participação |   **1 🧱** |

Os valores podem ser alterados durante os testes da feira.

# Direção de Arte

## Visual

* Cyberpunk
* Synthwave
* Neon
* Fundo escuro
* Circuitos
* Hologramas
* Partículas
* Efeitos luminosos

## Courier

Design simples e facilmente identificável.

Cada jogador possui uma cor diferente.

## Data Core

O Data Core deve ser visualmente chamativo, utilizando brilho e partículas para indicar seu estado.

# Áudio

## Música

Estilo:

* Synthwave
* Darksynth
* Electronic

## Efeitos

* Countdown
* Terminal
* Crypto Break
* Acerto
* Erro
* Data Core
* Dash
* Interceptação
* Extração
* Vitória

# Design para a Feira

O jogo deve seguir quatro princípios:

### Fácil de entender

O jogador deve compreender o objetivo em poucos segundos.

### Rápido

Uma partida deve durar poucos minutos.

### Competitivo

Os jogadores devem sentir vontade de vencer seus amigos.

### Recompensador

A vitória deve gerar mais tijolinhos.

# Monetização

A versão da feira não possui monetização tradicional.

Caso o jogo seja transformado em um produto comercial futuramente, poderão existir itens:

* Habilidades
* Acessórios de sobrevivências.
* Efeitos de Dash
* Efeitos de partículas
* Rastros
* Mapas

# Objetivos do Projeto

## Objetivo Principal

Criar um jogo multiplayer 2D rápido, competitivo e fácil de aprender para uma feira de jogos.

## Objetivos Técnicos

* Desenvolver um jogo utilizando Phaser 3.
* Utilizar TypeScript.
* Implementar multiplayer.
* Trabalhar sincronização em tempo real.
* Criar um sistema simples de puzzle.
* Criar uma experiência multiplayer competitiva.

# Roadmap

## Fase 1 - Protótipo

* [x] Conceito
* [x] GDD
* [x] Phaser instalado
* [x] TypeScript instalado
* [x] Vite instalado
* [ ] Configurar Phaser
* [ ] Criar cena principal
* [ ] Criar Courier
* [ ] Criar movimentação
* [ ] Criar mapa
* [ ] Criar colisões
* [ ] Criar Dash

## Fase 2 - Gameplay

* [ ] Criar Terminal
* [ ] Criar Crypto Break
* [ ] Criar Data Core
* [ ] Criar Extraction Point
* [ ] Criar sistema de interceptação
* [ ] Criar condição de vitória
* [ ] Criar tela de resultado
* [ ] Criar sistema de recompensas

## Fase 3 - Multiplayer

* [ ] Criar servidor
* [ ] Criar lobby
* [ ] Conectar jogadores
* [ ] Sincronizar movimentação
* [ ] Sincronizar Data Core
* [ ] Suportar 2 jogadores
* [ ] Testar até 8 jogadores

## Fase 4 - Polimento

* [ ] Arte final
* [ ] Efeitos neon
* [ ] Partículas
* [ ] HUD
* [ ] Sons
* [ ] Música
* [ ] Balanceamento
* [ ] Testes com jogadores

## Fase 5 - Feira

* [ ] Build final
* [ ] Teste multiplayer
* [ ] Teste de recompensas
* [ ] Correção de bugs
* [ ] Otimização
* [ ] Preparação dos computadores
* [ ] Teste final

# Identidade

## Nome

**COURIER.EXE**

## Slogan

> **BREAK THE CODE. RUN THE NETWORK.**

## Frase de Impacto

> **Quebre a criptografia, seja rápido e entregue os dados antes dos seus adversários.**

## Loop Principal

**Explorar → Encontrar → Decifrar → Roubar → Fugir → Extrair → Recompensa**