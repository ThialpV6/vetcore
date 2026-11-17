# 🐾 VetPocket — Sistema Clínico, Farmacológico e de Emergências Veterinárias

> **Aplicativo de bolso e prontuário inteligente para tomada de decisão rápida em Clínica Médica, Cirúrgica e Emergências de Animais Silvestres, Exóticos e Pets (Cães e Gatos).**

🔗 **Acesse o WebApp:** [https://thialpv6.github.io/vetpocket/](https://thialpv6.github.io/vetpocket/)

---

## 🎯 Sobre o Projeto

O **VetPocket** foi desenvolvido para eliminar erros de cálculo posológico, interações medicamentosas fatais e atrasos de conduta durante plantões e atendimentos de emergência. O sistema integra um banco de dados clínico auditado a calculadoras dinâmicas que ajustam automaticamente doses, diluições decimais e restrições biológicas de acordo com a fisiologia de cada táxon.

---

## ⚡ Funcionalidades Principais

* **🩺 Prontuário Clínico Inteligente & Consultor de Caso:**
  * Separação entre **Histórico/Causa de Entrada** e **Sinais Clínicos Isolados**, gerando condutas passo a passo específicas para a combinação de achados do paciente.
  * **Trava Farmacológica Dinâmica:** Bloqueia automaticamente medicamentos contraindicados para o táxon (ex: beta-lactâmicos orais em coelhos e roedores caviomorfos; ivermectina em quelônios; AINEs tóxicos em rapinantes e abutres) ou para o estado hemodinâmico atual (ex: suspensão automática de Meloxicam em pacientes com desidratação ≥ 8%, hemorragia GI ou choque elétrico).
  * **Avaliação Térmica e Glicêmica em Tempo Real:** Compara a temperatura aferida com a faixa basal específica da espécie (incluindo basoendotérmicos como *Xenarthra* e marsupiais) e calcula automaticamente a reposição de glicose 1:4 em casos de hipoglicemia crítica (< 60 mg/dL).
  * **Fluidoterapia e Nutrição Enteral Automáticas:** Calcula manutenção diária, reposição de desidratação (em mL/dia, mL/h e fracionamento q6h), bolus de choque, Taxa Metabólica Basal (kcal/dia) e volume máximo seguro por gavagem (mL/tomada).

* **⚖️ Calculadora Universal de Bolus, Microdoses (1:10 e 1:100) e Infusão Contínua (CRI):**
  * Cálculo instantâneo em `mL` e unidades de seringa de insulina (`UI`) com semáforo de segurança para volumes inferiores a `0,05 mL`.
  * Receitas prontas de preparo para **Diluição 1:10** e **Diluição 1:100** (essenciais para passeriformes, pequenos roedores, répteis e filhotes abaixo de 100 g).
  * **Calculadora de CRI & Gotejamento:** Presets de 1 toque para Fentanil, Lidocaína, Cetamina, Noradrenalina, Dobutamina, Metoclopramida e Furosemida em bomba de seringa (`mL/h`), equipo microgotas e macrogotas.

* **📚 Biblioteca Offline com 57 Fichas Clínicas + Auditoria de Fontes e Páginas:**
  * Cobertura de **14 grupos taxonômicos**: Cães, Gatos, *Didelphimorphia* (Gambás), Roedores, Lagomorfos (Coelhos), *Xenarthra* (Tatus e Tamanduás), Carnívoros Silvestres (*Cerdocyon thous*, *Leopardus* spp.), Primatas Neotropicais (*Platyrrhini*), *Psittaciformes*, *Passeriformes*, Aves de Rapina (*Falconiformes*, *Accipitriformes*, *Strigiformes*), Pernaltas/Aquáticas/*Cathartiformes*, *Testudines* e *Squamata*.
  * **Rastreabilidade Bibliográfica (`📖 Fonte & Pág.`):** Consulta direta ao livro-texto e página exata de onde cada posologia foi extraída (*Carpenter's Exotic Animal Formulary*, *Tratado de Animais Selvagens - Cubas et al.*, *Raptor Medicine, Surgery and Rehabilitation*, *Fowler's Zoo and Wild Animal Medicine*, *BSAVA Manuals* e diretrizes *RECOVER / ACVIM / ISCAID*).

* **🧠 Memória Clínica Evolutiva & Curadoria Colaborativa:**
  * Permite cadastrar novas espécies, novos fármacos e registrar aprendizados práticos de casos reais, com módulo de exportação e curadoria (*peer-review*) para validação antes da incorporação ao banco de dados mestre.

---

## 👨‍⚕️ Autor e Curadoria Científica

Desenvolvido e curado por **João Pedro Resende do Nascimento** — Medicina Veterinária (Clínica, Cirurgia e Medicina de Animais Selvagens e Exóticos).
