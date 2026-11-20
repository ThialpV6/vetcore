// ============================================================================
// VETCORE — BANCO DE DADOS CLÍNICO (database.js — PARTE A)
// ============================================================================

// 1. CATÁLOGO CURADO DE OBRAS CLÍNICAS (46 LIVROS & DIRETRIZES DE ALTA RELEVÂNCIA)
const CATALOGO_LIVROS = [
  { id: "phtls10", titulo: "PHTLS — Prehospital Trauma Life Support (10ª Ed.)", autores: "NAEMT", area: "Trauma & XABCDE (Fonte Original)", resumo: "Manual criador do protocolo XABCDE, priorizando o controle de hemorragia exsanguinante externa (X) antes do manejo de vias aéreas (A).", linkPdf: "https://drive.google.com/drive/search?q=PHTLS" },
  { id: "silverstein3", titulo: "Small Animal Critical Care Medicine (3ª Ed.)", autores: "Deborah C. Silverstein & Kate Hopper", area: "Terapia Intensiva & Emergência Internacional", resumo: "Referência padrão-ouro mundial em medicina intensiva, choque, metas de perfusão, ventilação, TCE e estabilização.", linkPdf: "https://drive.google.com/drive/search?q=Silverstein" },
  { id: "raiser", titulo: "Clínica Cirúrgica do Trauma em Cães e Gatos", autores: "Alceu Gaspar Raiser, Castro & Santalucia", area: "Trauma & Cirurgia de Emergência Nacional", resumo: "Abordagem sistemática do paciente politraumatizado, controle de danos e estabilização na rotina hospitalar brasileira.", linkPdf: "https://drive.google.com/drive/search?q=Raiser" },
  { id: "recover", titulo: "Diretrizes RECOVER (2024) & Plumb's Veterinary Drug Handbook (10ª Ed.)", autores: "Fletcher et al. / Donald C. Plumb", area: "RCP, Emergência & Farmacologia Clínica", resumo: "Consensos de ressuscitação cardiopulmonar (BLS/ALS) e formulário farmacológico padrão-ouro para cães e gatos.", linkPdf: "https://drive.google.com/drive/search?q=Plumb" },
  { id: "carpenter6", titulo: "Carpenter's Exotic Animal Formulary (6ª Ed.)", autores: "James W. Carpenter", area: "Bulário & Posologia de Silvestres e Exóticos", resumo: "Principal formulário internacional de doses para répteis, aves, pequenos mamíferos, marsupiais, primatas e fauna de zoológico.", linkPdf: "https://drive.google.com/drive/search?q=Carpenter%20Exotic%20Animal%20Formulary" },
  { id: "cubas2", titulo: "Tratado de Animais Selvagens — Medicina Veterinária (Vol. 1 e 2)", autores: "Zalmir S. Cubas, Jean Carlos R. Silva & José Luiz Catão-Dias", area: "Clínica, Cirurgia e Manejo de Fauna Neotropical", resumo: "Principal obra de medicina de animais selvagens no Brasil, cobrindo todas as ordens neotropicais.", linkPdf: "https://drive.google.com/drive/search?q=Tratado%20de%20Animais%20Selvagens" },
  { id: "west3", titulo: "Zoo Animal and Wildlife Immobilization and Anesthesia (3ª Ed.)", autores: "Gary West, Darryl Heard & Nigel Caulkett", area: "Anestesiologia e Contenção Química de Silvestres", resumo: "Edição atualizada padrão-ouro em contenção química, protocolos dissociativos/alfa-2/opioides, reversores e emergências anestésicas.", linkPdf: "https://drive.google.com/drive/search?q=Zoo%20Animal%20and%20Wildlife%20Immobilization%203rd" },
  { id: "papich", titulo: "Manual Saunders de Terapia Veterinária / Handbook of Veterinary Drugs", autores: "Mark G. Papich", area: "Farmacologia e Terapêutica Veterinária", resumo: "Posologia, farmacocinética, contraindicações, ajustes renais/hepáticos e interações medicamentosas.", linkPdf: "https://drive.google.com/drive/search?q=Papich" },
  { id: "spinosa6", titulo: "Farmacologia Aplicada à Medicina Veterinária (6ª Ed.)", autores: "Helenice de Souza Spinosa, Górniak & Bernardi", area: "Farmacologia Veterinária Geral e Especial", resumo: "Mecanismos de ação, analgésicos, anti-inflamatórios, anestésicos, fluidoterapia e antimicrobianos na clínica veterinária.", linkPdf: "https://drive.google.com/drive/search?q=Spinosa" },
  { id: "fowler10", titulo: "Fowler's Zoo and Wild Animal Medicine — Current Therapy, Vol. 10", autores: "R. Eric Miller, Nadine Lamberski & Paul P. Calle", area: "Medicina de Zoológico e Fauna Silvestre", resumo: "Terapias atualizadas, anestesia e clínica médica de carnívoros, primatas, xenarthra, marsupiais, aves e répteis.", linkPdf: "https://drive.google.com/drive/search?q=Fowler%20Vol%2010" },
  { id: "fowler_cl", titulo: "Zoo and Wild Animal Medicine (Fowler — Edição Clássica)", autores: "Murray E. Fowler & R. Eric Miller", area: "Fisiologia e Clínica de Animais Selvagens", resumo: "Parâmetros biológicos, fisiológicos, nutricionais e tabelas farmacológicas por táxon.", linkPdf: "https://drive.google.com/drive/search?q=Zoo%20and%20Wild%20Animal%20Medicine" },
  { id: "scott_raptor", titulo: "Raptor Medicine, Surgery and Rehabilitation", autores: "David E. Scott", area: "Medicina e Cirurgia de Aves de Rapina", resumo: "Referência essencial para gaviões, falcões, corujas e urubus: pododermatite (bumblefoot), ortopedia, intoxicações e formulário.", linkPdf: "https://drive.google.com/drive/search?q=Raptor%20Medicine" },
  { id: "falcon_hb", titulo: "Practical Handbook of Falcon Husbandry and Medicine", autores: "Remple & Forbes", area: "Clínica e Manejo de Falconiformes", resumo: "Manejo clínico, aspergilose, síndrome de disforia por opioides, pododermatite e cirurgia em falcões.", linkPdf: "https://drive.google.com/drive/search?q=Falcon%20Husbandry" },
  { id: "tully_aves", titulo: "Tully — Clínica de Aves (2ª Edição em Português)", autores: "Thomas N. Tully Jr., Dorrestein & Jones", area: "Clínica e Cirurgia Aviária", resumo: "Semiologia aviária, avaliação de desidratação, sacos aéreos, celoma e terapêutica por ordem.", linkPdf: "https://drive.google.com/drive/search?q=Tully%20Clinica%20de%20Aves" },
  { id: "blackwell_avian", titulo: "Blackwell's Five-Minute Veterinary Consult: Avian", autores: "Alan M. Fudge et al.", area: "Consulta Rápida de Doenças Aviárias", resumo: "Diagnósticos diferenciais rápidos, exames e tratamentos diretos para emergências e clínica de aves.", linkPdf: "https://drive.google.com/drive/search?q=Blackwell%20Avian" },
  { id: "forbes_avian", titulo: "Avian Medicine and Surgery: Self-Assessment Color Review (2ª Ed.)", autores: "Neil A. Forbes & Altman", area: "Casos Clínicos e Cirúrgicos em Aves", resumo: "Discussão diagnóstica e condutas baseadas em casos reais de medicina aviária.", linkPdf: "https://drive.google.com/drive/search?q=Avian%20Medicine%20and%20Surgery" },
  { id: "poultry13", titulo: "Diseases of Poultry (13ª Edição)", autores: "David E. Swayne et al.", area: "Doenças Infecciosas, Virais e Parasitárias de Aves", resumo: "Referência completa em patologia aviária, clamidiose, micoplasmose, tricomoníase, bouba, Newcastle e neoplasias.", linkPdf: "https://drive.google.com/drive/search?q=Diseases%20of%20Poultry" },
  { id: "mayer_advisor", titulo: "Clinical Veterinary Advisor: Birds and Exotic Pets", autores: "Jörg Mayer & Thomas M. Donnelly", area: "Algoritmos Clínicos de Aves, Répteis e Exóticos", resumo: "Diagnósticos diferenciais estruturados, protocolos passo a passo e árvore de decisão para exóticos.", linkPdf: "https://drive.google.com/drive/search?q=Clinical%20Veterinary%20Advisor%20Birds" },
  { id: "mitchell_tully", titulo: "Manual of Exotic Pet Practice", autores: "Mark A. Mitchell & Thomas N. Tully Jr.", area: "Clínica Médica de Pets Não-Convencionais", resumo: "Contenção, coleta de sangue, fluidoterapia e terapêutica de aves, répteis e pequenos mamíferos.", linkPdf: "https://drive.google.com/drive/search?q=Manual%20of%20Exotic%20Pet%20Practice" },
  { id: "omalley", titulo: "Clinical Anatomy and Physiology of Exotic Species", autores: "Bairbre O'Malley", area: "Anatomia e Fisiologia Aplicada de Exóticos", resumo: "Base anatômica e fisiológica comparada (sistema porta-renal, sacos aéreos, ceco de lagomorfos, termorregulação).", linkPdf: "https://drive.google.com/drive/search?q=Clinical%20Anatomy%20and%20Physiology%20of%20Exotic" },
  { id: "longley_anesth", titulo: "Anesthesia of Exotic Pets", autores: "Lesa Longley", area: "Anestesia de Aves, Répteis e Pequenos Mamíferos", resumo: "Protocolos de MPA, indução, intubação sem cuff, canulação de saco aéreo e monitoração em exóticos.", linkPdf: "https://drive.google.com/drive/search?q=Anesthesia%20of%20exotic%20pets" },
  { id: "vet_nursing3", titulo: "Veterinary Nursing of Exotic Pets and Wildlife (3ª Ed.)", autores: "Girling", area: "Terapia Intensiva, Sondagem e Enfermagem de Silvestres", resumo: "Cálculo de fluidoterapia, vias de acesso IO/IV, alimentação por sonda (gavagem) e suporte térmico por táxon.", linkPdf: "https://drive.google.com/drive/search?q=Veterinary%20Nursing%20of%20Exotic%20Pets%203rd" },
  { id: "rabbit_text2", titulo: "Textbook of Rabbit Medicine (2ª Edição)", autores: "Molly Varga / Frances Harcourt-Brown", area: "Medicina Interna e Cirurgia de Coelhos", resumo: "Fisiopatologia da estase gastrintestinal, odontologia, encefalitozoonose, analgesia e fluidoterapia em coelhos.", linkPdf: "https://drive.google.com/drive/search?q=Textbook%20of%20Rabbit%20Medicine" },
  { id: "bsava_rabbit", titulo: "BSAVA Manual of Rabbit Surgery, Dentistry and Imaging", autores: "Frances Harcourt-Brown & John Chitty", area: "Cirurgia, Odontologia e Imagem em Coelhos", resumo: "Abscessos faciais, bloqueios locorregionais, estase GI e cirurgia em lagomorfos.", linkPdf: "https://drive.google.com/drive/search?q=BSAVA%20Manual%20of%20Rabbit%20Surgery" },
  { id: "bsava_rodents", titulo: "BSAVA Manual of Rodents and Ferrets", autores: "Emma Keeble & Anna Meredith", area: "Medicina de Roedores e Furões", resumo: "Diferenças entre roedores caviomorfos (cobaia/chinchila) e miomorfos (rato/camundongo) e restrições antimicrobianas.", linkPdf: "https://drive.google.com/drive/search?q=BSAVA%20Manual%20of%20Rodents" },
  { id: "quinton_mam", titulo: "Novos Animais de Estimação: Pequenos Mamíferos", autores: "Jean-François Quinton", area: "Clínica de Roedores, Coelhos e Furões", resumo: "Semiologia, manejo nutricional, dermatologia e doses práticas em pequenos mamíferos.", linkPdf: "https://drive.google.com/drive/search?q=Quinton" },
  { id: "ophth_wild2", titulo: "Wild and Exotic Animal Ophthalmology — Vol. 2: Mammals", autores: "Montiani-Ferreira, Moore & Ben-Shlomo", area: "Oftalmologia de Mamíferos Selvagens e Exóticos", resumo: "Úlceras corneanas por espinhos de ouriço, trauma ocular, retinotoxicidade e cirurgia oftálmica comparada.", linkPdf: "https://drive.google.com/drive/search?q=Wild%20and%20Exotic%20Animal%20Ophthalmology" },
  { id: "monkeys_oneh", titulo: "Neglected Diseases in Monkeys: Monkey-Human Interface", autores: "Knauf & Jones-Engel", area: "Doenças Infecciosas e Zoonoses em Primatas", resumo: "Herpesvírus (HSV-1 letal em calitriquídeos), febre amarela, tuberculose, parasitoses e biossegurança em primatas.", linkPdf: "https://drive.google.com/drive/search?q=Neglected%20Diseases%20in%20Monkeys" },
  { id: "urin_repteis", titulo: "Sistema Urinário de Répteis (Artigo de Revisão)", autores: "Acervo Pasta Artigos", area: "Nefrologia de Répteis e Sistema Porta-Renal", resumo: "Fisiologia da excreção de ácido úrico, gota úrica visceral/articular, avaliação renal e implicações do sistema porta-renal.", linkPdf: "https://drive.google.com/drive/search?q=Sistema%20urinario%20repteis" },
  { id: "patol_repteis", titulo: "Patologia e Clínica de Répteis", autores: "Compêndio Herpetológico", area: "Clínica Médica de Quelônios, Serpentes e Lagartos", resumo: "Doença osteometabólica (DOM), hipovitaminose A, estomatite ulcerativa, pneumonia e retenção de ovos.", linkPdf: "https://drive.google.com/drive/search?q=Patologia%20de%20Repteis" },
  { id: "snakes_bites2", titulo: "Venomous Bites from Non-Venomous Snakes (2ª Ed.)", autores: "Scott A. Weinstein et al.", area: "Herpetologia e Toxicologia de Colubrídeos/Dipsadídeos", resumo: "Envenenamentos por serpentes opistóglifas (Philodryas, Clelia), manejo de mordeduras e coagulopatias.", linkPdf: "https://drive.google.com/drive/search?q=Venomous%20Bites" },
  { id: "peconhentos", titulo: "Guia de Bolso: Animais Peçonhentos", autores: "Ministério da Saúde / FUNED", area: "Acidentes Ofídicos e Escorpiônicos", resumo: "Diferenciação e soroterapia nos acidentes botrópico, crotálico, elapídico e laquético.", linkPdf: "https://drive.google.com/drive/search?q=Animais%20Peconhentos" },
  { id: "campbell_lab", titulo: "Exotic Animal Laboratory Diagnosis", autores: "Terry W. Campbell & K. R. Grant", area: "Patologia Clínica, Hematologia e Citologia de Exóticos", resumo: "Escolha do anticoagulante (EDTA vs. Heparina), hematologia de aves/répteis, bioquímica e análise de efusões cavitárias.", linkPdf: "https://drive.google.com/drive/search?q=Exotic%20Animal%20Laboratory%20Diagnosis" },
  { id: "crivellenti2", titulo: "Casos de Rotina em Medicina Veterinária de Pequenos Animais (2ª Ed.)", autores: "Leandro Z. Crivellenti & Sofia Borin-Crivellenti", area: "Clínica Médica e Emergências de Cães e Gatos", resumo: "Condutas práticas, fluxogramas diagnósticos e prescrições para cães e gatos.", linkPdf: "https://drive.google.com/drive/search?q=Casos%20de%20Rotina" },
  { id: "consulta_5min", titulo: "Consulta Veterinária em 5 Minutos (Cães e Gatos)", autores: "Tilley & Smith (Blackwell)", area: "Diagnóstico Diferencial Rápido em Pequenos Animais", resumo: "Referência ágil por sinais clínicos, alterações laboratoriais e protocolos terapêuticos.", linkPdf: "https://drive.google.com/drive/search?q=Consulta%20Veterinaria%20em%205%20Minutos" },
  { id: "kirk9", titulo: "Kirk & Bistner's Handbook of Veterinary Procedures and Emergency Treatment (9ª Ed. EN / PT)", autores: "Ford & Mazzaferro", area: "Emergências, Triagem, Intoxicações e Procedimentos", resumo: "Protocolos de toracocentese, abdominocentese, choque, intoxicações agudas e tabelas laboratoriais.", linkPdf: "https://drive.google.com/drive/search?q=Kirk%20Bistner" },
  { id: "fossum4", titulo: "Cirurgia de Pequenos Animais (4ª Edição)", autores: "Theresa Welch Fossum", area: "Clínica Cirúrgica, Feridas, Reconstrução e Pós-Operatório", resumo: "Manejo de feridas necróticas, desbridamento, enxertos, drenos, cirurgia abdominal/torácica e peritonite.", linkPdf: "https://drive.google.com/drive/search?q=Fossum" },
  { id: "ibanez_anest", titulo: "Anestesia Veterinária para Acadêmicos e Iniciantes", autores: "José Fernando Ibañez et al.", area: "Anestesiologia e Infusão Contínua (CRI)", resumo: "Cálculos passo a passo de MPA, indução, bloqueios e bombas de infusão contínua (FLK, MLK, Fentanil, Norepinefrina).", linkPdf: "https://drive.google.com/drive/search?q=Anestesia%20Veterinaria%20para%20Academicos" },
  { id: "thrall_rx", titulo: "Diagnóstico de Radiologia Veterinária", autores: "Donald E. Thrall", area: "Radiologia Torácica, Abdominal e Ortopédica", resumo: "Interpretação de padrões pulmonares, efusão pleural, perda de detalhe seroso abdominal (ascite) e fraturas.", linkPdf: "https://drive.google.com/drive/search?q=Thrall" },
  { id: "farrow_rx", titulo: "Veterinary Diagnostic Imaging: Birds, Exotic Pets, and Wildlife", autores: "Charles S. Farrow", area: "Radiologia de Aves, Répteis e Silvestres", resumo: "Anatomia radiográfica de sacos aéreos, proventrículo, retenção de ovos e esqueleto de silvestres.", linkPdf: "https://drive.google.com/drive/search?q=Veterinary%20Diagnostic%20Imaging%20Birds" },
  { id: "ultrasound", titulo: "Diagnostic Ultrasound in Small Animal Practice", autores: "Paddy Mannion", area: "Ultrassonografia Abdominal e FAST (AFAST / TFAST)", resumo: "Detecção de líquido livre abdominal/pleural, avaliação hepatobiliar, renal e reprodutiva.", linkPdf: "https://drive.google.com/drive/search?q=Diagnostic%20Ultrasound" },
  { id: "medleau_derm", titulo: "Dermatologia de Pequenos Animais — Atlas Colorido e Guia Terapêutico", autores: "Linda Medleau & Keith A. Hnilica", area: "Dermatologia Clínica e Otologia", resumo: "Protocolos tópicos e sistêmicos para piodermites, malasseziose, dermatofitose, sarnas e alergopatias.", linkPdf: "https://drive.google.com/drive/search?q=Dermatologia%20de%20Pequenos%20Animais" },
  { id: "wiggs_dent", titulo: "Wiggs's Veterinary Dentistry: Principles and Practice (2ª Ed.)", autores: "Lobprise & Dodd", area: "Odontologia Veterinária e de Exóticos", resumo: "Doença periodontal, bloqueios nervosos maxilares/mandibulares, fístulas oronasais e odontologia de lagomorfos/roedores.", linkPdf: "https://drive.google.com/drive/search?q=Wiggs%20Veterinary%20Dentistry" },
  { id: "equine_sec", titulo: "Equine Medicine Secrets", autores: "Catherine J. Savage", area: "Clínica e Emergência de Equinos", resumo: "Síndrome cólica, laminite, tenossinovite, linfangite ulcerativa, neonatologia e antimicrobianos em equinos.", linkPdf: "https://drive.google.com/drive/search?q=Equine%20Medicine%20Secrets" },
  { id: "necropsy_wild", titulo: "Wildlife Necropsy and Forensics", autores: "Patricia A. Pesavento et al.", area: "Patologia e Necropsia de Animais Silvestres", resumo: "Técnica de necropsia por táxon, coleta de amostras e determinação de causa mortis (trauma, broncoaspiração, intoxicação).", linkPdf: "https://drive.google.com/drive/search?q=Wildlife%20Necropsy" },
  { id: "semiologia_silv", titulo: "Semiologia e Manejo de Animais Silvestres", autores: "Acervo de Semiologia Selvagens", area: "Contenção Física e Exame Clínico", resumo: "Contenção física segura, vias de acesso e parâmetros fisiológicos.", linkPdf: "https://drive.google.com/drive/search?q=semiologia_de_Animais_Silvestres" }
];

// 2. PAINEL DE DROGAS DE EMERGÊNCIA, PCR, CRISE E ANTÍDOTOS (ABA 4: 🚨 EMERGÊNCIA)
const DROGAS_EMERGENCIA_DB = [
  { nome: "Adrenalina (Epinefrina) — PCR Dose Baixa", apres: "1 mg/mL (1:1000)", conc: 1.0, dosePadrao: 0.01, doseAves: 0.01, via: "IV ou IO a cada 3–5 min (2 ciclos de RCP — RECOVER 2024)", obs: "Se via Intratraqueal (IT): usar 0,02 a 0,1 mg/kg diluída em NaCl 0,9%.", cor: "rose" },
  { nome: "Atropina — PCR / Bradicardia Vagal", apres: "0,5 mg/mL", conc: 0.5, dosePadrao: 0.04, doseAves: 0.04, via: "IV ou IO rápido na PCR por tônus vagal / bradicardia sinusal severa", obs: "Não usar como MPA de rotina em aves (tampão mucoso traqueal).", cor: "rose" },
  { nome: "Atropina — ANTÍDOTO CHUMBINHO", apres: "0,5 mg/mL", conc: 0.5, dosePadrao: 0.25, doseAves: 0.25, via: "1/4 da dose IV lento + 3/4 IM ou SC (repetir conforme sialorreia/dispneia)", obs: "Dose de intoxicação por Organofosforado/Carbamato é de 0,2 a 0,5 mg/kg (Kirk & Bistner).", cor: "amber" },
  { nome: "Midazolam — Convulsão / Status Epilepticus", apres: "5 mg/mL", conc: 5.0, dosePadrao: 0.3, doseAves: 1.5, via: "IV, IM ou Intranasal (IN) imediato", obs: "1ª linha anticonvulsivante em todas as espécies (Plumb's / Carpenter).", cor: "purple" },
  { nome: "Manitol 20% — TCE / Hipertensão Intracraniana", apres: "200 mg/mL (20%)", conc: 200.0, dosePadrao: 500.0, doseAves: 500.0, via: "IV LENTO em 15 a 20 minutos (500 mg/kg = 2,5 mL/kg)", obs: "Aquecer o frasco se houver cristais. Contraindicado em desidratação severa não corrigida.", cor: "blue" },
  { nome: "Salina Hipertônica 7,5% — TCE + Choque", apres: "NaCl 7,5% (1 mL/kg)", conc: 1.0, dosePadrao: 4.0, doseAves: 3.0, via: "IV lento em 10 a 15 minutos (Dose já expressa em mL/kg: 3 a 4 mL/kg)", obs: "Para preparar 20 mL de NaCl 7,5%: misturar 6 mL de NaCl 20% + 14 mL de NaCl 0,9% (Silverstein).", cor: "blue" },
  { nome: "Furosemida — Edema Pulmonar Agudo", apres: "10 mg/mL", conc: 10.0, dosePadrao: 2.0, doseGato: 1.5, doseAves: 0.2, via: "IV ou IM a cada 2–8h conforme dispneia", obs: "⚠️ Aves são hipersensíveis (0,15–0,5 mg/kg)! Gatos: usar 1 a 2 mg/kg.", cor: "emerald" },
  { nome: "Butorfanol — Sedação na Dispneia / Edema", apres: "10 mg/mL", conc: 10.0, dosePadrao: 0.25, doseAves: 1.5, via: "IM ou IV", obs: "Reduz a ansiedade respiratória ('fome de ar') permitindo oxigenoterapia sem estresse.", cor: "emerald" },
  { nome: "Ácido Tranexâmico — Hemorragia (Letra X)", apres: "50 mg/mL", conc: 50.0, dosePadrao: 10.0, doseAves: 10.0, via: "IV lento em 15–20 min (rápido causa vômito!) ou IM", obs: "Inibe a fibrinólise no choque hemorrágico traumático e hemoabdômen (PHTLS / Silverstein).", cor: "rose" },
  { nome: "Glicose 50% — Crise Hipoglicêmica", apres: "500 mg/mL (0,5 g/mL)", conc: 500.0, dosePadrao: 250.0, doseAves: 500.0, via: "IV lento OBRIGATORIAMENTE DILUÍDA 1:4 em NaCl 0,9%!", obs: "O volume exibido refere-se à Glicose 50% pura: dilua esse volume com 3x o volume de NaCl 0,9% antes de injetar na veia!", cor: "amber" },
  { nome: "Gluconato de Cálcio 10% — Hipocalcemia / Distocia", apres: "100 mg/mL (10%)", conc: 100.0, dosePadrao: 50.0, doseAves: 100.0, via: "IV lento (monitorando FC/ECG!) ou SC diluído em NaCl 0,9%", obs: "Essencial na tetania hipocalcêmica, hipercalemia grave (cardioproteção) e retenção de ovo em aves/répteis.", cor: "teal" },
  { nome: "Flumazenil — Reversor de Benzodiazepínicos", apres: "0,1 mg/mL", conc: 0.1, dosePadrao: 0.02, doseAves: 0.05, via: "IV, IM ou Intranasal", obs: "Reverte Midazolam/Diazepam/Zolazepam em 1 a 3 minutos.", cor: "purple" }
];

// 3. PROTOCOLOS XABCDE E MANOBRAS SALVA-VIDAS PASSO A PASSO (ABA 4)
const PROTOCOLOS_MESTRES = {
  xabcde: {
    titulo: "🚨 Protocolo XABCDE de Atendimento Inicial ao Trauma e Estabilização",
    fontesBase: [
      "NAEMT — PHTLS (Prehospital Trauma Life Support, 10ª ed., Cap. Avaliação Primária)",
      "Silverstein & Hopper — Small Animal Critical Care Medicine (3ª ed., Cap. 1–4: Triage & Trauma)",
      "Raiser, Castro & Santalucia — Clínica Cirúrgica do Trauma",
      "Diretrizes VECCS / BVECCS / RECOVER Initiative (2024)"
    ],
    etapas: [
      {
        letra: "X", nome: "eXsanguinating Hemorrhage (Controle de Hemorragia Exsanguinante)", cor: "rose",
        geral: "Prioridade ZERO (antes mesmo da via aérea): hemorragias arteriais ou venosas externas graves matam em menos de 2 a 3 minutos (PHTLS / Raiser).\n• Conduta imediata: Compressão direta firme com gaze estéril, curativo compressivo ou pinçamento atraumático de vaso visível.\n• Antifibrinolítico precoce (primeiras 3h do trauma): Ácido Tranexâmico (10 mg/kg IV lento em 15–20 min ou IM).",
        porTaxon: {
          Aves: "Em aves, a volemia total é de ~6 a 10% do peso vivo (perder 0,5 mL em uma rolinha de 40 g é letal!). Comprimir imediatamente canhões de pena sangrantes; só tracionar o canhão pela base sob analgesia/sedação se o sangramento não estancar com pressão.",
          Tamandua: "🚨 TAMANDUÁS: Devido à deficiência fisiológica de fatores dependentes de Vitamina K, administrar obrigatoriamente Vitamina K1 (2 mg/kg SC/IM) imediatamente!"
        }
      },
      {
        letra: "A", nome: "Airway (Permeabilidade de Vias Aéreas e Proteção Cervical)", cor: "amber",
        geral: "Inspecionar cavidade oral, faringe e glote; remover sangue, coágulos, secreções ou corpos estranhos (espinhos de ouriço, sementes). Se inconsciente (Glasgow < 8) ou em apneia: intubação endotraqueal imediata (Silverstein 3ª ed.).",
        porTaxon: {
          Aves: "⛔ PROIBIDO USAR TUBO COM CUFF INFLADO EM AVES! Anéis traqueais completos e calcificados (cuff causa necrose e estenose traqueal fatal em 3–5 dias). Em obstrução traqueal alta ou de siringe: realizar CANULAÇÃO DE SACO AÉREO CAUDAL/ABDOMINAL imediatamente!",
          Coelhos: "Coelhos e Roedores Caviomorfos são respiradores nasais obrigatórios: desobstruir narinas primeiro e intubar com tubo sem cuff.",
          Tatu: "Tatus fazem apneia voluntária prolongada (até 10 minutos): não tente induzir na máscara a seco sem sedação IM prévia!"
        }
      },
      {
        letra: "B", nome: "Breathing (Ventilação, Oxigenação e Espaço Pleural/Celômico)", cor: "blue",
        geral: "Oxigenoterapia imediata (máscara sem estresse, flow-by ou câmara 40–60%). Avaliar padrão respiratório:\n• Movimento paradoxal / ausência de murmúrio dorsal = Pneumotórax (toracocentese no 7º–9º EIC dorsal).\n• Ausência de murmúrio ventral = Efusão pleural / Hemotórax (toracocentese no 7º–8º EIC ventral).",
        porTaxon: {
          Aves: "Aves NÃO possuem diafragma! A ventilação depende da excursão livre do esterno (quilha). ⛔ NUNCA contenha uma ave apertando o peito!",
          Repteis: "Quelônios e Serpentes não têm diafragma e fazem apneia prolongada. Ventilar por pressão positiva intermitente (2 a 4 mov/min) e usar ar ambiente na recuperação (gatilho respiratório é a hipóxia!)."
        }
      },
      {
        letra: "C", nome: "Circulation (Perfusão Tecidual, Acesso Vascular e Ressuscitação Volêmica)", cor: "emerald",
        geral: "Avaliar FC, pulso, mucosas, TPC e temperatura periférica. Acesso IV ou IO. Ressuscitação volêmica fracionada (Silverstein / PHTLS):\n• Bolus de Ringer Lactato aquecido: 10–15 mL/kg em Cães (ou 5–10 mL/kg em Gatos e Silvestres) em 15 minutos, reavaliando ausculta pulmonar antes de repetir.",
        porTaxon: {
          Gato: "🚨 TRÍADE DO CHOQUE FELINO (Bradicardia < 140 bpm + Hipotermia < 37,0 °C + Hipotensão): NUNCA faça expansão volêmica rápida em gato hipotérmico (< 37 °C) — causa EDEMA PULMONAR FATAL! Faça apenas 5 mL/kg lento, aqueça até >= 37,0 °C e só então reavalie.",
          Aves: "Vias IV: Jugular direita, Basílica ou Metatarsal medial. ⛔ ACESSO INTRAÓSSEO (IO) EM AVES: Exclusivamente na Ulna distal ou Tibiotarso! NUNCA no Úmero ou Fêmur (ossos pneumáticos conectados aos sacos aéreos!)."
        }
      },
      {
        letra: "D", nome: "Disability (Avaliação Neurológica, PIC e Analgesia Multimodal)", cor: "purple",
        geral: "Avaliar Escala de Glasgow Modificada, postura (decerebração, Schiff-Sherrington) e pupilas.\n• Suspeita de TCE / Hipertensão Intracraniana: Elevar cabeça a 30° (sem comprimir jugulares) + Manitol 20% (500 mg/kg = 2,5 mL/kg IV lento em 15–20 min) ou Salina Hipertônica 7,5% (3–4 mL/kg IV).\n• ⛔ PROIBIDO CORTICOIDES no TCE! Analgesia: Metadona/Butorfanol + Dipirona. ⛔ PROIBIDO AINE (Meloxicam) no choque!",
        porTaxon: {
          Aves: "A íris das aves e répteis possui musculatura estriada esquelética voluntária (não responde à Atropina!). No TCE aviário, manter em caixa escura, silenciosa e FRESCA (não superaquecer!)."
        }
      },
      {
        letra: "E", nome: "Exposure & Environment (Controle Térmico e Exame Secundário Completo)", cor: "teal",
        geral: "Após estabilizar X-A-B-C-D: inspecionar todo o corpo buscando feridas ocultas, miíase, espinhos de ouriço, fraturas de pelve/coluna e hérnias. Manter normotermia específica da espécie.",
        porTaxon: {
          Gamba: "Em Gambás (Didelphis): inspecionar sempre o marsúpio! Respeitar a basotermia (32,0 a 36,5 °C) — nunca aquecer acima de 36,5 °C!",
          Tamandua: "Em Xenarthra (Tatus, Tamanduás e Preguiças): temperatura normal é de 32,0 a 35,5 °C (aquecer para 38 °C mata por hipertermia!)."
        }
      }
    ]
  },
  manobras: [
    {
      titulo: "🦜 1. Canulação de Saco Aéreo Caudal em Aves (Asfixia por Obstrução Traqueal/Siringe)",
      fonte: "Anesthesia of Exotic Pets (Longley) & Tully — Clínica de Aves (2ª Ed.)",
      passos: "1) Indicação: Dispneia inspiratória severa com bico aberto/estridor (granuloma fúngico na siringe, semente/corpo estranho na traqueia ou trauma cervical) onde a intubação traqueal não resolve.\n2) Posicionamento: Decúbito lateral direito ou esquerdo, tracionando o membro pélvico cranialmente (ou caudalmente se preferir o acesso pré-crural).\n3) Ponto Anatômico (Triângulo Paralombal): Limite cranial = última costela; Limite dorsal = musculatura sinsacral/flexora; Limite caudal = músculos da coxa (fêmur).\n4) Técnica: Antissepsia rápida + bloqueio local (Lidocaína 1–2 mg/kg diluída). Incisão de pele de 3–5 mm. Perfurar a parede muscular em direção craniomedial com pinça hemostática mosquito fechada (sentir o 'pop' ao entrar no saco aéreo torácico caudal/abdominal), abrir as pontas da pinça e introduzir tubo endotraqueal sem cuff (ou sonda uretral cortada). Testar o fluxo de ar com uma pluma ou lâmina fria e suturar em bailarina."
    },
    {
      titulo: "🦴 2. Acesso Intraósseo (IO) de Emergência no Choque Hipovolêmico",
      fonte: "Veterinary Nursing of Exotic Pets (3ª Ed.) & Manual of Exotic Pet Practice (Mitchell & Tully)",
      passos: "1) Aves (⛔ NUNCA USAR ÚMERO OU FÊMUR — Ossos Pneumáticos!): Locais seguros são a ULNA DISTAL (inserir agulha hipodérmica 20G a 25G na crista dorsal do côndilo ulnar distal, paralela à diáfise) ou a CRISTA DO TIBIOTARSO CRANIAL.\n2) Pequenos Mamíferos, Filhotes, Gambás e Primatas: Fossa trocantérica do FÊMUR PROXIMAL, crista tibial cranial ou tubérculo maior do ÚMERO.\n3) Técnica: Bloqueio local no periósteo -> introduzir agulha com movimento de rotação firme até vencer a cortical -> aspirar mínima gota medular -> fazer flush lento com NaCl 0,9% heparinizado sentindo se não há extravasamento subcutâneo."
    },
    {
      titulo: "🫁 3. Toracocentese de Emergência (Pneumotórax vs. Efusão Pleural)",
      fonte: "Small Animal Critical Care Medicine (Silverstein 3ª Ed.) & Kirk & Bistner (9ª Ed.)",
      passos: "1) Equipamento: Escalpe (Butterfly 19G–23G) ou cateter acoplado a extensor + torneira de 3 vias + seringa de 20 mL.\n2) Localização: 7º ao 9º Espaço Intercostal (EIC), sempre na BORDA CRANIAL da costela caudal (evitar vasos e nervos intercostais que correm na borda caudal da costela!).\n3) Altura: No terço DORSAL do tórax se Pneumotórax (ar sobe); no terço VENTRAL se Efusão Pleural / Quilotórax / Hemotórax (líquido desce)."
    },
    {
      titulo: "💧 4. Abdominocentese & Diferenciação Rápida de Ascite / Efusão",
      fonte: "Exotic Animal Laboratory Diagnosis (Campbell) & Crivellenti (2ª Ed.)",
      passos: "1) Técnica: Decúbito lateral esquerdo ou estação; antissepsia 1–2 cm caudal à cicatriz umbilical na linha média (ou nos 4 quadrantes / guiada por AFAST), desviando do baço (quadrante cranial esquerdo).\n2) Classificação Rápida do Líquido:\n• Transudato Puro (Límpido, PT < 2,5 g/dL, baixa celularidade): Hipoalbuminemia severa (< 1,5 g/dL — enteropatia, nefropatia ou insuficiência hepática).\n• Transudato Modificado (Serossanguinolento, PT 2,5–5,0 g/dL): ICC direita, tamponamento pericárdico, hipertensão portal ou neoplasia.\n• Exsudato Não-Séptico Viscoso Amarelo-Ouro (PT > 4,5 g/dL, relação Albumina:Globulina < 0,4 em Gatos): Altamente sugestivo de PIF Efusiva (Peritonite Infecciosa Felina)."
    },
    {
      titulo: "⚠️ 5. Resgate de Broncoaspiração Aguda Pós-Gavagem / Regurgitação",
      fonte: "Tratado de Animais Selvagens (Cubas) & Clinical Veterinary Advisor (Mayer)",
      passos: "1) Ação Imediata (Segundos): Suspender a sondagem na hora! Posicionar o animal de cabeça para baixo (declive de 30–45°) e aspirar suavemente a cavidade oral, coana e glote com sonda uretral fina.\n2) Oxigenação & Broncodilatação/Ansiólise: Colocar imediatamente em câmara de O2 a 50–60%. Administrar Butorfanol (reduz o desespero respiratório) + Furosemida (Aves: 0,15–0,5 mg/kg IM; Mamíferos: 1,5–2 mg/kg IV/IM).\n3) Cobertura Antimicrobiana de Pneumonia Aspirativa: Iniciar Amoxicilina + Clavulanato + Enrofloxacina (ou Clindamicina + Enrofloxacina) + Nebulização com NaCl 0,9% por 15 min q8h. Manter NPO (jejum oral estrito) até estabilização respiratória, hidratando apenas por via SC/IV!"
    }
  ]
};

// 4. 20 ORDENS/GRUPOS TAXONÔMICOS DESMEMBRADOS + SUB-ESPÉCIES INDIVIDUAIS (SELETOR EM 2 NÍVEIS)
const TAXONS_DB = [
  {
    id: "Cao", grupo: "Pequenos Animais", nome: "🐶 Cães (Canis lupus familiaris)",
    tMin: 37.8, tBasalMin: 37.8, tMax: 39.2, fluidoManut: 50, bolusChoque: 15, fatorK: 70, gavMax: 30,
    tuboSangue: "Tubo Tampa Roxa (EDTA) p/ Hemograma + Tampa Vermelha/Amarela p/ Bioquímica",
    vias: "IV (cefálica, safena lateral, jugular), IO (úmero proximal, fêmur, tíbia), SC, IM, VO",
    proibido: "⛔ Diclofenaco, Ibuprofeno, Naproxeno, Piroxicam, Xilitol, Uvas/Passas. Ivermectina em alta dose / Loperamida em raças MDR1. AINEs bloqueados se desidratado, hipotenso ou GI.",
    regraOuro: "Na diarreia aguda sem sepse: evitar antimicrobianos empíricos (Consenso ENOVAT/ISCAID). Choque: prova de carga 10–15 mL/kg em 15 min reavaliando ausculta.",
    subespecies: [
      { nome: "Cão Adulto Padrão", peso: 10.0, unid: "kg", alerta: "" },
      { nome: "Raças Collies / Pastor Australiano / Shetland (Mutação MDR1)", peso: 18.0, unid: "kg", alerta: "🚨 MUTAÇÃO ABCB1 (MDR1): Proibido Ivermectina em dose antiparasitária alta, Milbemicina alta, Loperamida e Acepromazina/Butorfanol em dose cheia (reduzir 30–50%!)." },
      { nome: "Cão Toy / Filhote Pediátrico (< 2 kg)", peso: 1.2, unid: "kg", alerta: "🚨 PEDIÁTRICO / TOY: Risco severo de hipoglicemia e hipotermia! Usar Diluição 1:10 para fármacos concentrados." },
      { nome: "Cão Braquicefálico (Bulldog / Pug / Shih-tzu)", peso: 8.0, unid: "kg", alerta: "🚨 BRAQUICEFÁLICO: Alto risco de obstrução respiratória e hipertermia por estresse; pré-oxigenar sempre e postergar extubação até deglutição ativa." }
    ],
    sedacao: [
      { nome: "Contenção Moderada / Analgesia (Trauma / RX / Acesso)", drogas: [["Butorfanol", 0.3], ["Midazolam", 0.3]], via: "IM ou IV", obs: "Alta estabilidade cardiovascular (Ibañez / Crivellenti)." },
      { nome: "Contenção Intensa (Animal Agressivo / Hígido)", drogas: [["Cetamina", 3.0], ["Midazolam", 0.3], ["Metadona", 0.2]], via: "IM", obs: "Pode associar Dexmedetomidina (2 a 5 µg/kg IM) se hígido." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (5 mg/kg) + Midazolam (0.4 mg/kg) + Metadona (0.3 mg/kg) IM", 5, 100, 0.4, 5],
      etapa2: ["Propofol (8 mg/kg IV) até apneia e perda total do reflexo corneal/palpebral", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV rápido) EXCLUSIVAMENTE após plano anestésico profundo confirmado!", 1.0]
    }
  },
  {
    id: "Gato", grupo: "Pequenos Animais", nome: "🐱 Gatos (Felis catus)",
    tMin: 37.8, tBasalMin: 37.8, tMax: 39.2, fluidoManut: 40, bolusChoque: 5, fatorK: 70, gavMax: 25,
    tuboSangue: "Tubo Tampa Roxa (EDTA) + Vermelha/Verde (Atenção à agregação plaquetária felina!)",
    vias: "IV (cefálica, safena medial, jugular), IO, SC, IM, VO (SEMPRE dar 3–5 mL de água ou sachê após comprimido/cápsula para evitar estenose esofágica!)",
    proibido: "⛔ PARACETAMOL (100% LETAL — deficiência de UGT1A6!), Permetrina, Enema de Fosfato, Azul de Metileno, Diclofenaco, Azatioprina. ⚠️ ENROFLOXACINA: risco de degeneração retiniana aguda e cegueira irreversível mesmo em doses padrão (evitar como 1ª escolha!).",
    regraOuro: "Tríade do Choque Felino = Bradicardia + Hipotermia + Hipotensão: aquecer a >= 37,0 °C antes de expandir volemia (bolus máx 5–10 mL/kg lento). Jejum > 48h desencadeia Lipidose Hepática Felina!",
    subespecies: [
      { nome: "Gato Adulto Padrão", peso: 4.0, unid: "kg", alerta: "" },
      { nome: "Gato Idoso / Nefropata (DRC) / Desidratado", peso: 3.5, unid: "kg", alerta: "🚨 FELINO NEFROPATA / IDOSO: Proibido AINEs (Meloxicam) e Enrofloxacina (retenção renal precipita cegueira retiniana aguda mesmo com 5 mg/kg!)." },
      { nome: "Gato Obstruído (DTUIF / Hipercalemia)", peso: 4.5, unid: "kg", alerta: "🚨 OBSTRUÇÃO URETRAL: Se bradicardia/hipercalemia: Gluconato de Cálcio 10% (0,5–1 mL/kg IV lento em 10 min) + fluido NaCl 0,9% ou RL + sedação segura (Butorfanol + Midazolam + Bloqueio Coccígeo). Proibido Meloxicam!" },
      { nome: "Gato Filhote Pediátrico (< 800 g)", peso: 500, unid: "g", alerta: "🚨 GATINHO PEDIÁTRICO: Monitorar glicemia e temperatura; usar Diluição 1:10." }
    ],
    sedacao: [
      { nome: "Contenção Segura (Cardiopatas / Obstruídos DTUIF / Idosos)", drogas: [["Butorfanol", 0.3], ["Midazolam", 0.3]], via: "IM (epaxial ou quadríceps)", obs: "Mínima depressão cardiovascular." },
      { nome: "Contenção Química Completa (Desbridamento Miíase / Espinhos / Sutura)", drogas: [["Cetamina", 5.0], ["Midazolam", 0.3], ["Metadona", 0.2]], via: "IM", obs: "Lubrificar córneas (permanecem de olhos abertos sob cetamina)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (8 mg/kg) + Midazolam (0.4 mg/kg) + Butorfanol/Metadona (0.3 mg/kg) IM", 8, 100, 0.4, 5],
      etapa2: ["Propofol (8 mg/kg IV ou Intracelômico/IP se colapso venoso) até perda do reflexo corneal", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) SOMENTE após confirmação de inconsciência e arreflexia profunda!", 1.0]
    }
  },
  {
    id: "Gamba", grupo: "Marsupiais (Didelphimorphia)", nome: "🦡 Gambás / Saruês (Didelphis / Cuícas)",
    tMin: 32.0, tBasalMin: 34.0, tMax: 36.5, fluidoManut: 50, bolusChoque: 10, fatorK: 49, gavMax: 25,
    tuboSangue: "Microtubo EDTA (Hemograma) + Heparina de Lítio (Bioquímica — Veia Coccígea Lateral/Ventral)",
    vias: "IV (veia coccígea lateral/ventral na base da cauda, cefálica, safena lateral), SC (interescapular), IM, VO, IO (tíbia/fêmur)",
    proibido: "⛔ AINEs (Meloxicam) por mais de 3 dias (altíssimo risco de úlcera gástrica perfurante!). Proibido superaquecer acima de 36,5 °C! Evitar Enrofloxacina em filhotes lactentes.",
    regraOuro: "Basoendotérmicos: Taxa Metabólica Basal 30% menor que placentários (K=49). Temperatura de 32,0 a 33,9 °C durante o dia ou em tanatose ('fingir de morto') é FISIOLÓGICA — não aqueça agressivamente! Sempre inspecionar o marsúpio em fêmeas.",
    subespecies: [
      { nome: "Gambá-de-orelha-preta (Didelphis aurita)", peso: 1.5, unid: "kg", alerta: "" },
      { nome: "Gambá-de-orelha-branca (Didelphis albiventris)", peso: 1.4, unid: "kg", alerta: "" },
      { nome: "Filhote de Gambá / Cuíca (< 150 g)", peso: 80, unid: "g", alerta: "🚨 FILHOTE MARSUPIAL: Manter aquecido a 30–32 °C ambiental; usar sonda uretral nº 4 macia; Proibido Enrofloxacina (lesão de cartilagem de crescimento — usar Amoxi+Clav!)." }
    ],
    sedacao: [
      { nome: "Contenção Química Padrão (Exame / Radiografia / Espinhos)", drogas: [["Cetamina", 10.0], ["Midazolam", 0.5]], via: "IM", obs: "Indução em 5–8 min (Cubas 2ª ed., p. 502; West 3ª ed.)." },
      { nome: "Sedação Analgésica Sem Cetamina (Debilitados / TCE)", drogas: [["Butorfanol", 0.4], ["Midazolam", 0.5]], via: "IM", obs: "Seguro no TCE e em animais debilitados." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1 mg/kg) IM", 15, 100, 1.0, 5],
      etapa2: ["Propofol (10 mg/kg IV na veia coccígea) até plano profundo arreflexo", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após confirmação de plano anestésico profundo.", 1.0]
    }
  },
  {
    id: "Columbiformes", grupo: "Aves — Columbiformes", nome: "🕊️ Pombos e Rolinhas (Columbiformes)",
    tMin: 40.0, tBasalMin: 40.5, tMax: 42.5, fluidoManut: 60, bolusChoque: 10, fatorK: 78, gavMax: 20,
    tuboSangue: "Microtubo com Heparina de Lítio (Permite hemograma + bioquímica com mínimo volume!)",
    vias: "VO (gavagem no inglúvio), SC (prega inguinal), IM (terço médio/caudal do peitoral c/ seringa U-100), IV (metatarsal medial ou basílica — muito frágil!), IO (ulna distal / tibiotarso)",
    proibido: "⛔ PROIBIDO FENBENDAZOL E ALBENDAZOL EM POMBOS E ROLINHAS (Causa aplasia letal de medula óssea, leucopenia fulminante e necrose de criptas intestinais — Carpenter 6ª ed., p. 263!). ⛔ Proibido Corticoides e pomadas oleosas nas penas.",
    regraOuro: "Em ataque de gato (mesmo sem perfuração visível): iniciar Amoxicilina + Clavulanato (125 mg/kg VO BID) imediatamente contra Pasteurella multocida! Pele extremamente fina (sutura 5-0/6-0 sem tensão). Inspecionar cavidade oral p/ placas caseosas de Trichomonas gallinae.",
    subespecies: [
      { nome: "Rolinha-roxa / Fogo-apagou (Columbina spp. — 35 a 50g)", peso: 40, unid: "g", alerta: "🚨 MICROFAUNA (35–50 g): Usar obrigatoriamente as receitas de Diluição 1:10 ou 1:100! Volume máximo de coleta de sangue é de apenas 0,20 a 0,40 mL!" },
      { nome: "Pombo-doméstico (Columba livia — 300 a 400g)", peso: 350, unid: "g", alerta: "Verificar presença de placas amareladas orofaríngeas (Tricomoníase -> Metronidazol 25–50 mg/kg BID ou Carnidazol) e moscas hipoboscídeas sob as penas (Pseudolynchia -> transmitir Haemoproteus)." },
      { nome: "Juriti / Pomba-asa-branca (Leptotila / Patagioenas)", peso: 220, unid: "g", alerta: "Espécies silvestres altamente suscetíveis à miopatia de captura e desplumamento de estresse (autotomia folicular — segurar envolvendo o corpo em toalha macia sem puxar penas!)." }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ Manejo, Radiografia e Sutura", drogas: [["Midazolam", 2.0], ["Butorfanol", 2.0]], via: "IM (peitoral) ou Intranasal", obs: "Reversor do Midazolam: Flumazenil (0,05 mg/kg IM). Evitar Cetamina pura!" },
      { nome: "Contenção / Procedimento Doloroso Curto", drogas: [["Cetamina", 15.0], ["Midazolam", 2.0]], via: "IM", obs: "Complementar com bloqueio local (Lidocaína máx 2 mg/kg diluída)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (20 mg/kg) + Midazolam (2 mg/kg) IM no músculo peitoral", 20, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV/IO) ou Isoflurano em máscara até apneia e perda de reflexo corneal", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV/IO) somente após inconsciência profunda confirmada.", 1.0]
    }
  },
  {
    id: "Passeriformes", grupo: "Aves — Passeriformes", nome: "🐦 Passeriformes (Sabiás, Canários, Trinca-ferros)",
    tMin: 40.5, tBasalMin: 41.0, tMax: 43.0, fluidoManut: 60, bolusChoque: 10, fatorK: 129, gavMax: 20,
    tuboSangue: "Capilar Heparinizado / Microtubo Heparina de Lítio (Coletar da Jugular Direita)",
    vias: "VO, SC (prega inguinal), IM (peitoral c/ agulha de insulina), IO (tibiotarso)",
    proibido: "⛔ Corticoides, fármacos puros sem diluir 1:10 ou 1:100, jejum > 1 hora (hipoglicemia fulminante!), contenção física > 2 minutos!",
    regraOuro: "Maior taxa metabólica entre os vertebrados (Fator K = 129)! Se a ave abrir o bico e fechar os olhos durante o exame físico: PARE IMEDIATAMENTE e devolva para a caixa escura oxigenada (risco de morte súbita na mão!).",
    subespecies: [
      { nome: "Sabiá-laranjeira / Bem-te-vi (Turdus / Pitangus — 60 a 75g)", peso: 65, unid: "g", alerta: "" },
      { nome: "Trinca-ferro / Sanhaço (Saltator / Thraupis — 40 a 50g)", peso: 45, unid: "g", alerta: "Altíssimo metabolismo; utilizar Diluição 1:10 ou 1:100." },
      { nome: "Canário / Coleiro / Curió / Azulão (12 a 25g)", peso: 18, unid: "g", alerta: "🚨 PASSERIFORME < 25 g: Qualquer fármaco injetável puro é letal por superdosagem volumétrica — usar OBRIGATORIAMENTE a Diluição 1:100 ou via oral/intranasal!" }
    ],
    sedacao: [
      { nome: "Sedação Intranasal / IM Antiestresse", drogas: [["Midazolam", 2.0], ["Butorfanol", 2.0]], via: "Intranasal ou IM", obs: "Reduz drasticamente o óbito por colapso simpatoadrenal na contenção." }
    ],
    eutanasia: {
      etapa1: ["Midazolam (3 mg/kg) + Cetamina (25 mg/kg) IM (usar Diluição 1:10!)", 25, 100, 3.0, 5],
      etapa2: ["Isoflurano em câmara/máscara ou Propofol até plano cirúrgico profundo", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV/IC) somente após plano anestésico profundo e arreflexia.", 1.0]
    }
  },
  {
    id: "Psittaciformes", grupo: "Aves — Psittaciformes", nome: "🦜 Psittaciformes (Papagaios, Araras, Calopsitas)",
    tMin: 40.0, tBasalMin: 40.0, tMax: 42.0, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 25,
    tuboSangue: "Microtubo com Heparina de Lítio (Jugular direita ou Metatarsal medial)",
    vias: "IM (peitoral), SC (prega inguinal), VO (sonda metálica com abridor de bico), IV (jugular direita, basílica, metatarsal medial), IO (ulna distal ou tibiotarso)",
    proibido: "⛔ Corticoides (aspergilose aguda fatal), Enrofloxacina IM repetida (mionecrose peitoral), IO em úmero ou fêmur, tubo endotraqueal com cuff inflado, Atropina na MPA (tampão mucoso asfixiante!).",
    regraOuro: "Nunca fazer gavagem alimentar em ave hipotérmica (< 39,5 °C), recém-sedada ou desidratada: o inglúvio entra em estase e a ave regurgita e broncoaspira! Se broncoaspirar: suspender VO, O2 imediato, Furosemida (0,15 a 0,5 mg/kg IM), nebulização NaCl 0,9% e Amoxi+Clav + Enrofloxacina.",
    subespecies: [
      { nome: "Papagaio-verdadeiro (Amazona aestiva — 350 a 450g)", peso: 400, unid: "g", alerta: "Alta incidência de hipovitaminose A (metaplasia escamosa de coanas/sinusite) e Clamidiose (Doxiciclina 35–50 mg/kg). Em remoção de espinhos de ouriço: aguardar retorno completo dos reflexos antes de alimentar por sonda!" },
      { nome: "Calopsita (Nymphicus hollandicus — 80 a 100g)", peso: 90, unid: "g", alerta: "Atenção à aspiração de sementes na traqueia (dispneia aguda com estridor -> Canulação de Saco Aéreo Caudal imediata!) e retenção de ovo." },
      { nome: "Arara-canindé / Vermelha (Ara spp. — 900g a 1.3kg)", peso: 1.1, unid: "kg", alerta: "Bico de altíssima pressão (usar abridor de bico metálico ou acrílico espesso na sondagem!). Dividir volumes IM > 0,4 mL nos dois lados do peito." },
      { nome: "Periquito / Maritaca / Tiriba (Brotogeris / Pionus / Pyrrhura)", peso: 120, unid: "g", alerta: "" }
    ],
    sedacao: [
      { nome: "Contenção / Remoção de Espinhos / Radiografia", drogas: [["Midazolam", 2.0], ["Butorfanol", 2.0]], via: "IM ou Intranasal", obs: "Para procedimentos mais intensos (ex: remoção de espinhos de ouriço), associar Cetamina (10–15 mg/kg IM) ou Isoflurano." },
      { nome: "Contenção Química Dissociativa Balanceada", drogas: [["Cetamina", 15.0], ["Midazolam", 2.0]], via: "IM (dividir nos dois lados do peito se volume > 0,35 mL)", obs: "Recuperação suave graças ao Midazolam." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (20 mg/kg) + Midazolam (2 mg/kg) IM", 20, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV na jugular direita/basílica) até apneia e arreflexia corneal", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "Ramphastidae", grupo: "Aves — Piciformes", nome: "🪶 Tucanos e Araçaris (Ramphastidae)",
    tMin: 39.5, tBasalMin: 40.0, tMax: 41.5, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 20,
    tuboSangue: "Microtubo com Heparina de Lítio (Jugular direita)",
    vias: "IV (jugular direita, metatarsal medial), IM (peitoral), SC (inguinal), VO",
    proibido: "⛔ PROIBIDO FERRO DEXTRANO / SUPLEMENTOS COM FERRO ou Vitamina C junto à dieta (causa Hemocromatose / Doença do Acúmulo de Ferro hepático fatal!). Proibido obstruir a base dorsal do bico (narinas!).",
    regraOuro: "O bico do tucano é altamente vascularizado e atua como trocador de calor (perde temperatura rápido na anestesia!). Não possuem inglúvio verdadeiro dilatável como os psitacídeos (cuidado com volume de gavagem!).",
    subespecies: [
      { nome: "Tucano-toco (Ramphastos toco — 500 a 750g)", peso: 600, unid: "g", alerta: "" },
      { nome: "Tucano-de-bico-verde / Preto (R. dicolorus / R. vitellinus)", peso: 360, unid: "g", alerta: "" },
      { nome: "Araçari (Pteroglossus aracari — 200 a 280g)", peso: 230, unid: "g", alerta: "" }
    ],
    sedacao: [
      { nome: "Contenção Segura (Midazolam + Butorfanol)", drogas: [["Midazolam", 1.5], ["Butorfanol", 1.5]], via: "IM", obs: "Proteger o bico contra impactos durante indução e recuperação." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1.5 mg/kg) IM", 15, 100, 1.5, 5],
      etapa2: ["Propofol (10 mg/kg IV) até plano profundo", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após inconsciência confirmada.", 1.0]
    }
  },
  {
    id: "Strigiformes", grupo: "Aves de Rapina Noturnas", nome: "🦉 Corujas (Strigiformes)",
    tMin: 39.5, tBasalMin: 40.0, tMax: 41.5, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 15,
    tuboSangue: "⚠️ Usar HEPARINA DE LÍTIO (O EDTA causa hemólise em diversas espécies de corujas!)",
    vias: "IV (veia metatarsal medial = excelente!, basílica, jugular direita), IO (ulna/tibiotarso), SC, IM, VO",
    proibido: "⛔ PROIBIDO XILAZINA E ALFA-2 AGONISTAS EM CORUJAS (arritmias ventriculares e depressão cardiorrespiratória fatal!). ⛔ Proibido Diclofenaco, Flunixin e Cetoprofeno (gota visceral letal).",
    regraOuro: "🚨 ANATOMIA CRÍTICA: Corujas NÃO POSSUEM INGLÚVIO (PAPO) VERDADEIRO! A sonda vai direto ao proventrículo — nunca ultrapasse 12 a 15 mL/kg por tomada e infunda devagar para evitar regurgitação e morte por aspiração! Imobilizar as garras primeiro e realizar exame oftálmico completo (câmara posterior!).",
    subespecies: [
      { nome: "Coruja-buraqueira (Athene cunicularia — 140 a 180g)", peso: 160, unid: "g", alerta: "" },
      { nome: "Suindara / Coruja-das-torres (Tyto furcata — 400 a 500g)", peso: 450, unid: "g", alerta: "" },
      { nome: "Corujinha-do-mato (Megascops choliba — 100 a 130g)", peso: 115, unid: "g", alerta: "" },
      { nome: "Murucututu / Mocho-orelhudo (Pulsatrix / Asio — 650 a 900g)", peso: 750, unid: "g", alerta: "" }
    ],
    sedacao: [
      { nome: "Sedação Padrão-Ouro p/ Corujas (Sem Alfa-2!)", drogas: [["Midazolam", 1.5], ["Butorfanol", 2.0]], via: "IM ou IV", obs: "Raptor Medicine (Scott, p. 296). Se precisar de imobilização maior, adicionar Cetamina (5 a 8 mg/kg IM)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1.5 mg/kg) IM", 15, 100, 1.5, 5],
      etapa2: ["Propofol (8 a 10 mg/kg IV na metatarsal medial) até apneia e arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "RapinantesDiurnos", grupo: "Aves de Rapina Diurnas", nome: "🦅 Gaviões, Falcões e Caracarás (Accipitriformes / Falconiformes)",
    tMin: 40.0, tBasalMin: 40.0, tMax: 42.0, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 20,
    tuboSangue: "Microtubo com Heparina de Lítio (Metatarsal medial ou Basílica)",
    vias: "IV (metatarsal medial, basílica, jugular direita), IO (ulna/tibiotarso), SC, IM, VO",
    proibido: "⛔ Diclofenaco, Flunixin, Cetoprofeno, Ibuprofeno (necrose tubular renal e gota visceral letal!). Fenbendazol em altas doses (aplasia medular e distrofia de penas).",
    regraOuro: "Possuem inglúvio verdadeiro. Inspecionar sempre a planta dos pés para prevenção/tratamento de Pododermatite (Bumblefoot).",
    subespecies: [
      { nome: "Gavião-carijó (Rupornis magnirostris — 250 a 320g)", peso: 280, unid: "g", alerta: "" },
      { nome: "Caracará (Caracara plancus — 900g a 1.3kg)", peso: 1.1, unid: "kg", alerta: "" },
      { nome: "Falcões: Quiriquiri / Falcão-de-coleira / Peregrino (Falco spp.)", peso: 150, unid: "g", alerta: "🚨 PARTICULARIDADE EM FALCÕES (Falcon Medicine / Scott, p. 296): Doses padrão de Butorfanol (> 0,6 mg/kg) causam hiperestesia e disforia motora em Falco spp.! Reduzir Butorfanol para 0,2 a 0,5 mg/kg associado ao Midazolam!" }
    ],
    sedacao: [
      { nome: "Contenção / Radiografia / Curativo de Bumblefoot", drogas: [["Midazolam", 1.0], ["Butorfanol", 0.5]], via: "IM", obs: "Associar Cetamina (5 a 10 mg/kg IM) se necessário relaxamento completo." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1.5 mg/kg) IM", 15, 100, 1.5, 5],
      etapa2: ["Propofol (10 mg/kg IV) até plano profundo", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "Cathartiformes", grupo: "Aves — Cathartiformes", nome: "🦅 Urubus (Coragyps / Cathartes / Sarcoramphus)",
    tMin: 39.5, tBasalMin: 39.5, tMax: 41.5, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 20,
    tuboSangue: "Tubo Heparina de Lítio (Veia Metatarsal Medial ou Basílica)",
    vias: "IV (veia metatarsal medial ou basílica), IO (ulna/tibiotarso), SC, IM (peitoral — dividir se > 0,4 mL por lado!), VO",
    proibido: "⛔ TODOS OS AINEs SÃO 100% LETAIS EM URUBUS EXCETO O MELOXICAM (Diclofenaco, Flunixin, Carprofeno e Cetoprofeno matam em 24–48h!). ⛔ PROIBIDO Fenbendazol! ⛔ PROIBIDO fita/esparadrapo nos tarsos (fazem urohidrose — dermatite necrosante!).",
    regraOuro: "Regurgitam como defesa quando contidos ou sedados: manter a cabeça inclinada para baixo após a MPA e intubar rapidamente para evitar broncoaspiração! Para contenção IM em indivíduos de ~1,5 kg: dividir o volume total de Cetamina+Midazolam entre os dois lados do peito.",
    subespecies: [
      { nome: "Urubu-de-cabeça-preta (Coragyps atratus — 1.3 a 1.8kg)", peso: 1.5, unid: "kg", alerta: "" },
      { nome: "Urubu-de-cabeça-vermelha (Cathartes aura — 1.2 a 1.6kg)", peso: 1.4, unid: "kg", alerta: "" },
      { nome: "Urubu-rei (Sarcoramphus papa — 3.0 a 3.8kg)", peso: 3.3, unid: "kg", alerta: "" }
    ],
    sedacao: [
      { nome: "Protocolo de Contenção / Pré-Eutanásia (Dividir Peitoral!)", drogas: [["Cetamina", 15.0], ["Midazolam", 1.5]], via: "IM (Dividir 50% no peitoral direito e 50% no peitoral esquerdo!)", obs: "Em um urubu de 1,5 kg, dividir o volume igualmente nos dois lados da quilha." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 a 20 mg/kg) + Midazolam (1.5 a 2 mg/kg) IM (dividido bilateralmente no peitoral)", 15, 100, 1.5, 5],
      etapa2: ["Propofol (10 mg/kg IV na veia metatarsal medial ou basílica) até apneia e perda total do reflexo corneal", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) EXCLUSIVAMENTE após confirmação de inconsciência cirúrgica profunda!", 1.0]
    }
  },
  {
    id: "Pernaltas", grupo: "Aves Aquáticas, Marinhas e Pernaltas", nome: "🦩 Garças, Socós, Curicacas, Saracuras e Atobás",
    tMin: 39.5, tBasalMin: 39.5, tMax: 41.5, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 20,
    tuboSangue: "Tubo Heparina de Lítio (Veia Metatarsal Medial = 1ª escolha)",
    vias: "IV (veia metatarsal medial = 1ª escolha absoluta!, jugular direita), IO, SC, IM, VO",
    proibido: "⛔ Cetamina + Xilazina em pernaltas/aquáticas. ⛔ NUNCA fechar o bico de Atobás ou Biguás com fita (não têm narinas externas abertas e morrem asfixiados!).",
    regraOuro: "🚨 SEGURANÇA DE EQUIPE: Garças e Socós desferem botes em lança diretamente nos OLHOS do manejador — segurar sempre a cabeça/base do crânio primeiro e usar óculos EPI! Alto risco de Miopatia de Captura nas pernas longas: hidratar, suplementar Vitamina E/Selênio e suspender em Tipoia (Sling).",
    subespecies: [
      { nome: "Garça-branca / Socó (Ardea / Egretta / Nycticorax)", peso: 850, unid: "g", alerta: "🚨 RISCO OCULAR: Imobilizar o bico e pescoço antes de retirar da caixa! Manter pescoço reto na intubação/sondagem." },
      { nome: "Curicaca / Colhereiro (Theristicus / Platalea)", peso: 1.3, unid: "kg", alerta: "Cuidado com fratura iatrogênica do bico longo; prevenir miopatia de captura com Midazolam + fluidoterapia." },
      { nome: "Saracura / Frango-d'água / Jaçanã (Rallidae / Charadriiformes)", peso: 260, unid: "g", alerta: "" },
      { nome: "Atobá / Biguá / Fragata (Suliformes — Aves Marinhas)", peso: 1.2, unid: "kg", alerta: "🚨 ANATOMIA RESPIRATÓRIA DE SULIFORMES: Atobás e Biguás possuem narinas externas obliteradas (respiram pelas fendas orais laterais do bico). Se você passar esparadrapo fechando o bico, a ave morre asfixiada (colocar um espaçador/palito transversal entre as mandíbulas se precisar conter o bico!)." }
    ],
    sedacao: [
      { nome: "Sedação Antiestresse (Prevenção de Miopatia de Captura)", drogas: [["Midazolam", 1.5], ["Butorfanol", 1.5]], via: "IM ou IV (metatarsal)", obs: "Relaxa a musculatura esquelética reduzindo rabdomiólise por estresse." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1.5 mg/kg) IM", 15, 100, 1.5, 5],
      etapa2: ["Propofol (10 mg/kg IV na veia metatarsal medial) até apneia e arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "Coelhos", grupo: "Lagomorpha", nome: "🐰 Coelhos (Oryctolagus), Tapetis e Lebres",
    tMin: 38.5, tBasalMin: 38.5, tMax: 40.0, fluidoManut: 80, bolusChoque: 10, fatorK: 70, gavMax: 15,
    tuboSangue: "Microtubo EDTA + Heparina (Veia Safena Lateral ou Marginal da Orelha)",
    vias: "IV (veia marginal da orelha, safena lateral, cefálica), SC, IM (epaxial/quadríceps), VO, IO",
    proibido: "⛔ PROIBIDO POR VIA ORAL: Amoxicilina, Ampicilina, Cefalexina, Clindamicina, Lincomicina e Eritromicina (enterotoxemia letal por Clostridium spiroforme!). ⛔ PROIBIDO FIPRONIL (Frontline® = óbito 100%!).",
    regraOuro: "Qualquer dor ou estresse paralisa o ceco (Estase GI): tratar com hidratação agressiva (80–100 mL/kg/dia) + analgesia potente (Meloxicam 1 mg/kg BID + Dipirona + Tramadol + Maropitant 1 mg/kg SC) + alimentação assistida imediata com papa de fibras (sem jejum!).",
    subespecies: [
      { nome: "Coelho Doméstico (Oryctolagus cuniculus — 1.5 a 3.0kg)", peso: 2.0, unid: "kg", alerta: "" },
      { nome: "Tapeti Silvestre (Sylvilagus brasiliensis — 800g a 1.2kg)", peso: 950, unid: "g", alerta: "Extremamente suscetível a fratura lombar (L7) se contido sem suporte dos membros pélvicos!" },
      { nome: "Lebre-europeia (Lepus europaeus — 3.0 a 4.5kg)", peso: 3.8, unid: "kg", alerta: "" }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ Exame Dentário / Radiografia", drogas: [["Midazolam", 1.0], ["Butorfanol", 0.5]], via: "IM ou SC", obs: "Associar Cetamina (10–15 mg/kg IM) se necessário relaxamento mandibular (BSAVA Rabbit Surgery)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (25 mg/kg) + Midazolam (2 mg/kg) IM", 25, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV na marginal da orelha) até plano profundo", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "Caviomorfos", grupo: "Roedores Caviomorfos & Erethizontidae", nome: "🐹 Porquinho-da-índia, Chinchila, Ouriço-cacheiro e Capivara",
    tMin: 37.5, tBasalMin: 37.5, tMax: 39.2, fluidoManut: 80, bolusChoque: 10, fatorK: 70, gavMax: 15,
    tuboSangue: "Microtubo Heparina de Lítio (Veia Safena Lateral, Cefálica ou Jugular)",
    vias: "SC, IM (máx 0,1 a 0,2 mL por ponto em pequenos), VO, IO (fêmur/tíbia), IV (safena/cefálica)",
    proibido: "⛔ PROIBIDO BETA-LACTÂMICOS E LINCOSAMIDAS POR VIA ORAL (Amoxicilina, Cefalexina, Clindamicina, Penicilinas — enterotoxemia fatal!).",
    regraOuro: "Não vomitam (não fazer jejum > 1h). Cobaias e Capivaras não sintetizam Vitamina C (suplementar 30 a 50 mg/kg/dia VO/SC!). Diluir sempre a Enrofloxacina 1:4 em NaCl 0,9% no SC.",
    subespecies: [
      { nome: "Porquinho-da-índia (Cavia porcellus — 700g a 1.1kg)", peso: 850, unid: "g", alerta: "Suplementar Vitamina C obrigatória (30–50 mg/kg/dia)." },
      { nome: "Chinchila (Chinchilla lanigera — 450 a 650g)", peso: 500, unid: "g", alerta: "Não suportam calor ambiental > 26 °C (golpe de calor rápido!)." },
      { nome: "Ouriço-cacheiro / Coandu (Coendou prehensilis — 2.5 a 4.0kg)", peso: 3.0, unid: "kg", alerta: "Roedor arborícola herbívoro caviomorfo: evitar beta-lactâmicos orais! Contenção química intramuscular na coxa ou cauda ventral (Cetamina 10 mg/kg + Midazolam 0,5 mg/kg)." },
      { nome: "Capivara (Hydrochoerus hydrochaeris — 25 a 55kg)", peso: 35.0, unid: "kg", alerta: "Suplementar Vitamina C; alto risco de timpanismo cecal em decúbito prolongado." }
    ],
    sedacao: [
      { nome: "Sedação Segura (Midazolam + Butorfanol)", drogas: [["Midazolam", 1.0], ["Butorfanol", 1.0]], via: "IM ou SC", obs: "BSAVA Manual of Rodents and Ferrets." },
      { nome: "Contenção Química (Ouriço-cacheiro / Caviomorfos)", drogas: [["Cetamina", 10.0], ["Midazolam", 0.5]], via: "IM", obs: "Fowler / Cubas." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (30 mg/kg) + Midazolam (2 mg/kg) IM", 30, 100, 2.0, 5],
      etapa2: ["Propofol IV/IP ou Isoflurano até arreflexia profunda", 10, 10],
      etapa3: ["KCl 19,1% IV/IC após plano profundo.", 1.0]
    }
  },
  {
    id: "Miomorfos", grupo: "Roedores Onívoros & Insetívoros Exóticos", nome: "🐀 Ratos (Rattus), Camundongos, Hamsters e Ouriço-pigmeu (Atelerix)",
    tMin: 37.0, tBasalMin: 37.5, tMax: 38.5, fluidoManut: 80, bolusChoque: 10, fatorK: 70, gavMax: 15,
    tuboSangue: "Microtubo Heparina de Lítio / EDTA (Veia Lateral da Cauda aquecida ou Safena)",
    vias: "SC, VO, IP, IM (quadríceps — máx 0,05 a 0,1 mL), IV (veia lateral da cauda)",
    proibido: "⛔ Proibido segurar pela ponta da cauda (desluvamento cutâneo traumático!). Em Hamsters: evitar Amoxicilina/Clindamicina oral!",
    regraOuro: "DIFERENÇA CRUCIAL PARA COBAIAS: Ratos (Rattus) e Camundongos são onívoros e TOLERAM Amoxicilina+Clavulanato (20 mg/kg VO BID) perfeitamente sem enterotoxemia (Carpenter 6ª ed., p. 526)! Na micoplasmose respiratória: Doxiciclina (5–10 mg/kg BID) + Enrofloxacina (10 mg/kg BID).",
    subespecies: [
      { nome: "Rato Twister / Mercol (Rattus norvegicus — 300 a 500g)", peso: 350, unid: "g", alerta: "" },
      { nome: "Camundongo (Mus musculus — 25 a 40g)", peso: 30, unid: "g", alerta: "Usar Diluição 1:10 ou 1:100 obrigatória." },
      { nome: "Ouriço-pigmeu-africano (Atelerix albiventris — 350 a 500g)", peso: 400, unid: "g", alerta: "Insetívoro (família Erinaceidae): tolera Amoxicilina+Clavulanato (15 mg/kg BID) e Clindamicina (11 mg/kg BID) normalmente! Para desenrolar e examinar: Isoflurano em câmara ou Midazolam + Butorfanol SC no manto dorsal." }
    ],
    sedacao: [
      { nome: "Contenção Química (Cetamina + Midazolam + Butorfanol)", drogas: [["Cetamina", 20.0], ["Midazolam", 1.0], ["Butorfanol", 1.0]], via: "IM ou SC", obs: "Manter sob tapete térmico na recuperação." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (40 mg/kg) + Midazolam (2 mg/kg) IP/IM", 40, 100, 2.0, 5],
      etapa2: ["Propofol IV/IP ou Isoflurano até perda total de reflexos", 10, 10],
      etapa3: ["KCl 19,1% após plano anestésico profundo confirmado.", 1.0]
    }
  },
  {
    id: "Tamandua", grupo: "Xenarthra — Pilosa", nome: "🐜 Tamanduás (Mirim / Bandeira) & Preguiças (Bradypus / Choloepus)",
    tMin: 32.0, tBasalMin: 32.5, tMax: 35.5, fluidoManut: 40, bolusChoque: 10, fatorK: 35, gavMax: 20,
    tuboSangue: "Tubo EDTA + Vermelho (Veia Safena Medial, Cefálica ou Coccígea Ventral)",
    vias: "IV (safena medial, cefálica, coccígea ventral), SC, IM, VO",
    proibido: "⛔ PROIBIDO fazer cirurgia ou antibioticoterapia prolongada em Tamanduás sem suplementar VITAMINA K1 (1 a 2 mg/kg SC/IM — risco de diátese hemorrágica fatal!). ⛔ Proibido aquecer acima de 36,0 °C!",
    regraOuro: "Basoendotérmicos estritos (32,0 a 35,5 °C) com metabolismo 40% menor (K=35). Atenção máxima às garras torácicas!",
    subespecies: [
      { nome: "Tamanduá-mirim (Tamandua tetradactyla — 4 a 7kg)", peso: 5.0, unid: "kg", alerta: "Obrigatório Vitamina K1 (1–2 mg/kg SC/IM). Boca tubular sem dentes impede intubação convencional." },
      { nome: "Tamanduá-bandeira (Myrmecophaga tridactyla — 25 a 45kg)", peso: 32.0, unid: "kg", alerta: "Obrigatório Vitamina K1; contenção física das garras torácicas sob anestesia." },
      { nome: "Preguiça-de-três-dedos / Dois-dedos (Bradypus / Choloepus)", peso: 4.2, unid: "kg", alerta: "🚨 PARTICULARIDADE EM PREGUIÇAS (Cubas / Fowler): Possuem estômago plurilocular fermentativo gigante (que representa até 30% do peso corporal cheio!) — evitar antibióticos orais de espectro Gram+ que destruam a microbiota fermentativa e descontar o conteúdo gástrico/vesical no cálculo de fármacos de janela estreita! Temp normal: 32,0 a 35,0 °C." }
    ],
    sedacao: [
      { nome: "Contenção Química a Campo / Ambulatório", drogas: [["Cetamina", 8.0], ["Midazolam", 0.3]], via: "IM (músculo glúteo/coxa)", obs: "Fowler / Cubas / West 3ª ed.: doses reduzidas pelo baixo metabolismo basal." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (0.5 mg/kg) IM", 15, 100, 0.5, 5],
      etapa2: ["Propofol (6 a 8 mg/kg IV na safena) até apneia e arreflexia", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "Tatu", grupo: "Xenarthra — Cingulata", nome: "🛡️ Tatus (Dasypus / Euphractus / Cabassous)",
    tMin: 32.0, tBasalMin: 32.5, tMax: 35.5, fluidoManut: 35, bolusChoque: 10, fatorK: 35, gavMax: 20,
    tuboSangue: "Tubo EDTA + Heparina (Veia Coccígea Ventral na linha média da cauda)",
    vias: "IV (coccígea ventral na linha média da cauda, safena), SC (região ventral macia), IM (membros pélvicos), VO",
    proibido: "⛔ Proibido induzir na máscara de Isoflurano a seco (fazem apneia voluntária de até 10 minutos!). ⛔ Proibido aquecer acima de 36,0 °C!",
    regraOuro: "Temperatura normal é baixa (32 a 35,5 °C). Nas fraturas de carapaça: lavar com NaCl 0,9%, desbridar miíase, proteger exposição óssea com hidrogel e só estabilizar com resina após controlar infecção.",
    subespecies: [
      { nome: "Tatu-galinha (Dasypus novemcinctus — 3.5 a 5.5kg)", peso: 4.0, unid: "kg", alerta: "" },
      { nome: "Tatu-peba (Euphractus sexcinctus — 4.0 a 6.5kg)", peso: 5.0, unid: "kg", alerta: "" }
    ],
    sedacao: [
      { nome: "Contenção Química p/ Desenrolar e Examinar", drogas: [["Cetamina", 10.0], ["Midazolam", 0.4]], via: "IM (musculatura femoral)", obs: "Permite manipulação segura e radiografias." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (0.5 mg/kg) IM", 15, 100, 0.5, 5],
      etapa2: ["Propofol (8 mg/kg IV na coccígea ventral) até arreflexia", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "Primatas", grupo: "Primatas Neotropicais (Platyrrhini)", nome: "🐒 Saguis (Callithrix), Micos, Macacos-prego e Bugios",
    tMin: 38.0, tBasalMin: 38.5, tMax: 40.0, fluidoManut: 60, bolusChoque: 10, fatorK: 70, gavMax: 25,
    tuboSangue: "Microtubo EDTA + Heparina (Veia Femoral no triângulo femoral ou Safena)",
    vias: "IV (safena lateral/medial, femoral, cefálica), IO (tíbia/fêmur), IM (quadríceps), SC, VO",
    proibido: "⛔ CONTATO SEM MÁSCARA COM HUMANO COM HERPES LABIAL (HSV-1 humano causa encefalite 100% fatal em Saguis!). ⛔ Meloxicam nas primeiras 48h de choque elétrico! ⛔ Jejum > 2h em Saguis!",
    regraOuro: "Callitrichidae (Saguis < 400g) fazem hipoglicemia fulminante: aferir glicemia na chegada! Primatas do Novo Mundo NÃO metabolizam Vitamina D2 vegetal — exigem Vitamina D3 (Colecalciferol) e UVB. Em choque elétrico: fluido 1,5–2x manutenção + alcalinização urinária + opioide.",
    subespecies: [
      { nome: "Sagui-de-tufos-brancos / Pretos (Callithrix spp. — 250 a 400g)", peso: 320, unid: "g", alerta: "🚨 RISCO DE HIPOGLICEMIA E HERPESVÍRUS HUMANO: Usar máscara e luvas sempre; checar glicemia na triagem." },
      { nome: "Macaco-prego (Sapajus apella / S. nigritus — 2.2 a 4.0kg)", peso: 2.8, unid: "kg", alerta: "" },
      { nome: "Bugio / Guariba (Alouatta guariba — 4.5 a 7.0kg)", peso: 5.5, unid: "kg", alerta: "Folívoros fermentadores cecocólicos e sentinela para Febre Amarela." }
    ],
    sedacao: [
      { nome: "Contenção Química Rápida (Curativos / Exame / Acesso)", drogas: [["Cetamina", 8.0], ["Midazolam", 0.4]], via: "IM (quadríceps)", obs: "Monitorar temperatura e glicemia durante toda a sedação (West 3ª ed.)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1 mg/kg) IM", 15, 100, 1.0, 5],
      etapa2: ["Propofol (8 mg/kg IV) até apneia e arreflexia corneal", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "CarnivorosSilv", grupo: "Carnívoros Silvestres", nome: "🦊 Cachorro-do-mato, Felídeos Silvestres, Quatis e Mustelídeos",
    tMin: 38.0, tBasalMin: 38.0, tMax: 39.3, fluidoManut: 50, bolusChoque: 12, fatorK: 70, gavMax: 30,
    tuboSangue: "Tubo EDTA + Tampa Vermelha/Amarela (Cefálica, Safena ou Jugular)",
    vias: "IV (cefálica, safena, jugular), IM (dardos/zarabatana ou manual com cambão/puçá), SC, VO",
    proibido: "⛔ Corticoides no TCE! Em Felídeos silvestres (Leopardus / Puma): mesmas restrições do gato doméstico (Proibido Paracetamol; evitar Enrofloxacina > 5 mg/kg).",
    regraOuro: "Alto risco biológico de Raiva (EPI completo!). No TCE por atropelamento em Cerdocyon thous: elevar cabeça 30°, Manitol 20% (500 mg/kg IV lento em 20 min) ou Salina 7,5%, Metadona + Midazolam se convulsão.",
    subespecies: [
      { nome: "Cachorro-do-mato / Graxaim (Cerdocyon thous — 5 a 8kg)", peso: 6.0, unid: "kg", alerta: "Canídeo silvestre: segue posologia farmacológica próxima à canina." },
      { nome: "Gato-do-mato / Jaguatirica / Jaguarundi (Leopardus / Herpailurus)", peso: 4.5, unid: "kg", alerta: "🚨 FELÍDEO SILVESTRE: Possui a mesma deficiência de glicuronidação (Proibido Paracetamol!) e sensibilidade retiniana à Enrofloxacina (máx 5 mg/kg SID) do gato doméstico!" },
      { nome: "Quati / Mão-pelada (Nasua nasua / Procyon cancrivorus)", peso: 4.5, unid: "kg", alerta: "Procyonidae: resistentes a doses baixas de sedativos; Cetamina (8–10 mg/kg) + Midazolam (0,5 mg/kg) IM." },
      { nome: "Furão / Irara / Lontra (Mustelidae)", peso: 1.5, unid: "kg", alerta: "" }
    ],
    sedacao: [
      { nome: "Contenção Química Segura a Campo / Gaiola de Contenção", drogas: [["Cetamina", 5.0], ["Midazolam", 0.3], ["Butorfanol", 0.2]], via: "IM", obs: "Fowler Tab. 34.3 (p. 719) / West 3ª ed." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (10 mg/kg) + Midazolam (0.5 mg/kg) IM", 10, 100, 0.5, 5],
      etapa2: ["Propofol (8 mg/kg IV) até perda total do reflexo corneal", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  {
    id: "Testudines", grupo: "Répteis — Testudines", nome: "🐢 Jabutis, Cágados e Tigres-d'água (Testudines)",
    tMin: 26.0, tBasalMin: 26.0, tMax: 30.0, fluidoManut: 20, bolusChoque: 5, fatorK: 10, gavMax: 12,
    tuboSangue: "⚠️ OBRIGATÓRIO HEPARINA DE LÍTIO (O EDTA lisa as hemácias de quelônios! Preferir Jugular ao Seio Subcarapacial p/ evitar hemodiluição linfática!)",
    vias: "IM e SC EXCLUSIVAMENTE nos MEMBROS ANTERIORES, IV (jugular externa, seio subcarapacial, coccígea dorsal), Banho morno / Cloacal, VO",
    proibido: "⛔ PROIBIDO IVERMECTINA E TODAS AS AVERMECTINAS (Paralisia flácida irreversível e morte em 100% dos quelônios — Carpenter 6ª ed., p. 117!).",
    regraOuro: "Manter na POTZ (26 a 30 °C) durante todo o tratamento para que absorvam e excretem os fármacos (Artigo Sistema Urinário de Répteis). Aplicar injetáveis nos membros torácicos (evitar o Sistema Porta-Renal caudal). Na recuperação anestésica, ventilar com ar ambiente (1 a 2 mov/min).",
    subespecies: [
      { nome: "Jabuti-piranga / Tinga (Chelonoidis carbonarius / C. denticulatus)", peso: 3.0, unid: "kg", alerta: "" },
      { nome: "Tigre-d'água / Cágado-de-barbicha (Trachemys / Phrynops)", peso: 1.2, unid: "kg", alerta: "Quelônios semiaquáticos: manter hidratação e acesso seco aquecido após procedimentos." }
    ],
    sedacao: [
      { nome: "Relaxamento Cervical p/ Exame Oral, Esôfago e Sondagem", drogas: [["Cetamina", 15.0], ["Midazolam", 1.5]], via: "IM (membros anteriores)", obs: "Associar Tramadol (5–10 mg/kg) se houver fratura de carapaça." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (30 mg/kg) + Midazolam (2 mg/kg) IM nos membros anteriores", 30, 100, 2.0, 5],
      etapa2: ["Propofol (12 mg/kg IV no seio subcarapacial ou jugular) até perda de reflexos", 12, 10],
      etapa3: ["KCl 19,1% (1.5 mL/kg IV/IC) após anestesia profunda.", 1.5]
    }
  },
  {
    id: "Serpentes", grupo: "Répteis — Squamata (Ophidia & Sauria)", nome: "🐍 Serpentes (Jiboias / Arco-íris) & Lagartos (Teiú / Iguana)",
    tMin: 27.0, tBasalMin: 28.0, tMax: 32.0, fluidoManut: 20, bolusChoque: 5, fatorK: 10, gavMax: 10,
    tuboSangue: "Microtubo com Heparina de Lítio (Veia Coccígea Ventral caudal à cloaca)",
    vias: "IM (musculatura epaxial na METADE CRANIAL em serpentes; membros anteriores em lagartos), SC, IV (coccígea ventral caudal à cloaca), VO",
    proibido: "⛔ Em Serpentes: Morfina e Fentanil têm baixa eficácia analgésica isolada (preferir Tramadol + bloqueio local!). Evitar aplicações no terço caudal.",
    regraOuro: "Glote rostral fácil de visualizar: intubar com tubo sem cuff e ventilar (2 mov/min). Em estomatite ulcerativa infecciosa: cultura + Ceftazidima (20 mg/kg IM a cada 72h) ou Enrofloxacina diluída.",
    subespecies: [
      { nome: "Jiboia / Arco-íris-da-Caatinga (Boa constrictor / Epicrates cenchria)", peso: 1.5, unid: "kg", alerta: "Ophidia: aplicar injetáveis na musculatura epaxial na metade cranial do corpo." },
      { nome: "Teiú / Iguana-verde (Salvator merianae / Iguana iguana)", peso: 2.0, unid: "kg", alerta: "Sauria: cuidado com autotomia caudal (nunca segurar pela cauda!); em Iguanas, investigar Doença Osteometabólica (DOM / Hipocalcemia)." }
    ],
    sedacao: [
      { nome: "Contenção / Procedimentos Clínicos", drogas: [["Cetamina", 15.0], ["Midazolam", 1.5]], via: "IM no terço cranial dorsal", obs: "Manter aquecida a 28–30 °C na recuperação." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (30 mg/kg) + Midazolam (2 mg/kg) IM cranial", 30, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV na coccígea ventral após sedação profunda)", 10, 10],
      etapa3: ["KCl 19,1% (1.5 mL/kg IV/IC) após confirmação de inconsciência profunda.", 1.5]
    }
  }
];
// ============================================================================
// VETCORE — BANCO DE DADOS CLÍNICO (database.js — PARTE B)
// Cole este bloco logo abaixo da Parte A no mesmo arquivo database.js
// ============================================================================

// 5. GUIAS SEMIOLÓGICOS DE DESIDRATAÇÃO E ESCORE CORPORAL POR GRUPO
const GUIAS_SEMIOLOGICOS = {
  padraoMamiferos: {
    desid: [
      ["5% (Leve / Subclínica)", "Mucosas levemente pegajosas; turgor cutâneo retorna em ~2s. (Nota em Gatos Caquéticos/Idosos: a perda de elastina falseia o turgor — avalie o brilho corneano e a umidade gengival)."],
      ["6% a 8% (Moderada)", "Retorno da prega cutânea lento (3–4s), mucosas secas, TPC 2–3s, olhos discretamente encovados na órbita."],
      ["10% a 12% (Grave / Choque)", "Tenda cutânea persistente (> 5s), enoftalmia marcada, extremidades frias, taquicardia (ou bradicardia < 140 bpm no choque felino) e pulso femoral filiforme."]
    ],
    ecc: [
      ["ECC 1–2/9 + Perda Muscular Severa", "Caquexia / Sarcopenia: Costelas, vértebras lombares e pelve visíveis à distância; atrofia muscular temporal e epaxial evidente. (Se o peso na balança estiver subindo com ECC 1–2/9, investigar Ascite / Efusão!)."],
      ["ECC 3–4/9 (Magro)", "Costelas facilmente palpáveis com cobertura mínima de gordura; cintura abdominal marcada."],
      ["ECC 5/9 (Ideal)", "Costelas palpáveis sem excesso de gordura; cintura visível de cima e prega abdominal presente."],
      ["ECC 6–7/9 (Sobrepeso)", "Costelas palpáveis com leve dificuldade sob camada de gordura; cintura pouco evidente."],
      ["ECC 8–9/9 (Obeso)", "Costelas não palpáveis sob espessa camada adiposa; depósito de gordura lombar e inguinal pendular."]
    ]
  },
  padraoAves: {
    desid: [
      ["5% (Leve)", "Preenchimento da veia basílica (face ventral da asa) levemente retardado (1–2s após compressão); discreta perda do brilho ocular (Tully 2ª ed.)."],
      ["7% a 8% (Moderada)", "Pele sobre a quilha (esterno) e tarso formando prega fina persistente; muco espesso em fios na cavidade oral/coana ('baba pegajosa'); enchimento da veia basílica > 2s."],
      ["10% a 12% (Grave / Colapso)", "Olhos encovados, extremidades/tarsos frios, colapso venoso basílico e metatarsal, depressão severa e estase completa de inglúvio."]
    ],
    ecc: [
      ["Quilha 1/5 (Caquexia / Emaciação)", "Quilha esternal extremamente saliente ('em lâmina de faca'); musculatura peitoral côncava e severamente atrofiada."],
      ["Quilha 2/5 (Magro)", "Quilha facilmente palpável e proeminente; músculo peitoral levemente deprimido."],
      ["Quilha 3/5 (Ideal)", "Músculo peitoral convexo/arredondado preenchendo as laterais da quilha."],
      ["Quilha 4–5/5 (Sobrepeso / Obeso)", "Músculo peitoral ultrapassa o nível da quilha formando sulco central; depósitos de gordura subcutânea amarela inguinal/furcular."]
    ]
  },
  padraoRepteis: {
    desid: [
      ["5% (Leve)", "Perda discreta da elasticidade da pele cervical/axilar; saliva espessa em cordão na cavidade oral."],
      ["8% a 10% (Moderada a Grave)", "Olhos profundamente afundados na órbita (enoftalmia), pregas cutâneas longitudinais persistentes, disecdise (retenção de muda) e ácido úrico pastoso/seco na cloaca."]
    ],
    ecc: [
      ["Caquético / Emaciado", "Fossa pré-femoral (quelônios) profundamente escavada; processos espinhosos dorsais e ossos pélvicos salientes (serpentes e lagartos)."],
      ["Magro", "Redução discreta da massa muscular em membros anteriores e base da cauda."],
      ["Ideal", "Bom preenchimento muscular nos membros, base da cauda e fossa pré-femoral."]
    ]
  }
};

// 6. QUADROS CLÍNICOS E DETECTOR AUTOMÁTICO DE SINTOMAS NA ANAMNESE
const SINAIS_DB = {
  miiase: {
    label: "🐛 Miíase / Ferida Necrótica",
    palavras: ["miiase", "miíase", "bicheira", "larva", "necros", "perda de tecido", "ferida", "abscesso"],
    conduta: "1) Analgesia sistêmica ANTES da limpeza (Dipirona + Metadona/Butorfanol/Tramadol) + bloqueio local.\n2) Expulsão química rápida de larvas: Nitenpiram (Capstar® 1 a 2 mg/kg VO ou retal diluído — efeito em 30–60 min).\n3) Lavagem abundante com NaCl 0,9% morno + Clorexidina aquosa 0,05% e desbridamento cirúrgico de tecido necrótico (Fossum 4ª ed.).\n4) Antimicrobiano p/ tecido desvitalizado e anaeróbios: Clindamicina ou Amoxicilina + Clavulanato (+ Metronidazol).",
    focoDrogas: ["Clindamicina", "Amoxicilina+Clav", "Metronidazol", "Nitenpiram", "Dipirona", "Metadona"],
    bloqueiaMelox: false, pedePesoMagro: false
  },
  ascite: {
    label: "💧 Ascite / Efusão Abdominal",
    palavras: ["ascit", "efusao", "efusão", "liquido livre", "líquido livre", "barriga aumentada", "abaulad", "aumentando peso", "ganhando peso"],
    conduta: "1) Abdominocentese diagnóstica/aliviadora + análise físico-química e citológica (Transudato Puro = hipoalbuminemia; Transudato Modificado = ICC direita/hipertensão portal; Exsudato amarelo viscoso rico em globulina com relação A:G < 0,4 em Gato = forte suspeita de PIF Efusiva! — Campbell / Crivellenti).\n2) ⚖️ AJUSTE DE DOSE: O líquido ascítico não metaboliza fármacos — informe o Peso Magro Estimado abaixo!\n3) ⛔ AINEs (Meloxicam) suspensos pelo risco renal.",
    focoDrogas: ["Furosemida", "Dipirona"],
    bloqueiaMelox: true, pedePesoMagro: true
  },
  ataque_gato: {
    label: "🐈 Ataque / Mordedura de Gato",
    palavras: ["ataque de gato", "mordida de gato", "arranhadura", "pasteurella"],
    conduta: "🚨 EMERGÊNCIA INFECCIOSA (Pasteurella multocida): Septicemia fatal em 24–48h mesmo sem perfuração visível na pele! Iniciar IMEDIATAMENTE Amoxicilina + Clavulanato (ou Enrofloxacina/Doxiciclina) + lavagem exaustiva + analgesia (Carpenter 6ª ed. / Tully).",
    focoDrogas: ["Amoxicilina+Clav", "Enrofloxacina", "Dipirona", "Meloxicam"],
    bloqueiaMelox: false, pedePesoMagro: false
  },
  ourico: {
    label: "🦔 Espinhos de Ouriço (Coendou)",
    palavras: ["ourico", "ouriço", "espinho"],
    conduta: "1) Remover sob sedação/anestesia + analgesia multimodal (nunca cortar a haste plástica do espinho rente à pele!).\n2) Inspecionar palato, língua, faringe, esôfago/inglúvio, córnea (teste de fluoresceína obrigatório! — Wild Animal Ophthalmology) e tórax (risco de pneumotórax/migração).\n3) ⚠️ ALERTA EM AVES: Não realizar gavagem alimentar volumosa antes da recuperação total dos reflexos protetores (risco fatal de regurgitação e broncoaspiração!).",
    focoDrogas: ["Midazolam", "Cetamina", "Metadona", "Butorfanol", "Amoxicilina+Clav", "Clindamicina", "Meloxicam"],
    bloqueiaMelox: false, pedePesoMagro: false
  },
  tce: {
    label: "🧠 TCE / Trauma Craniano",
    palavras: ["tce", "anisocoria", "estupor", "trauma craniano", "atropel", "colisao", "colisão"],
    conduta: "1) Elevar cabeça e pescoço em rampa rígida a 30° (sem comprimir jugulares!).\n2) Oxigenoterapia + Manitol 20% (500 mg/kg = 2,5 mL/kg IV lento em 15–20 min) ou Salina Hipertônica 7,5% (3–4 mL/kg IV) (Silverstein 3ª ed. / Raiser).\n3) ⛔ PROIBIDO CORTICOIDES (Dexametasona/Prednisolona) e Cetamina isolada!",
    focoDrogas: ["Manitol 20%", "Metadona", "Butorfanol", "Midazolam", "Dipirona"],
    bloqueiaMelox: false, pedePesoMagro: false
  },
  convulsao: {
    label: "⚡ Convulsão Ativa / Status",
    palavras: ["convuls", "epilep", "mioclon", "status epilepticus", "tremor"],
    conduta: "1) 1ª Linha imediata: Midazolam (Mamíferos: 0,3–0,5 mg/kg IV/IM/IN; Aves: 1–2 mg/kg IM/IN).\n2) Aferir Glicemia (< 60 mg/dL: Glicose 50% 0,5–1 mL/kg diluída 1:4 em NaCl 0,9% IV lento) e Cálcio sérico.",
    focoDrogas: ["Midazolam", "Manitol 20%"],
    bloqueiaMelox: false, pedePesoMagro: false
  },
  dispneia: {
    label: "🫁 Dispneia / Edema / Broncoaspiração",
    palavras: ["dispneia", "cianose", "bico aberto", "edema pulmonar", "broncoaspir", "engasgo", "sonda"],
    conduta: "1) Mínima contenção física + O2 imediato.\n2) Suspeita de Edema Pulmonar ou Broncoaspiração pós-sonda: suspender VO, Furosemida (Mamíf: 1,5–2 mg/kg; Aves: 0,15–0,5 mg/kg IM/IV), Butorfanol e nebulização NaCl 0,9%.\n3) Obstrução traqueal alta em aves: Canulação de Saco Aéreo Caudal!",
    focoDrogas: ["Furosemida", "Butorfanol", "Amoxicilina+Clav", "Enrofloxacina", "Doxiciclina"],
    bloqueiaMelox: false, pedePesoMagro: false
  },
  choque_eletrico: {
    label: "⚡ Choque Elétrico (Rede/Fio)",
    palavras: ["eletric", "elétric", "rede eletrica", "fio", "queimadura"],
    conduta: "1) Edema pulmonar neurogênico nas primeiras 24h (O2 + Furosemida + Butorfanol).\n2) Rabdomiólise + Mioglobinúria (urina escura): Fluidoterapia IV 1,5 a 2x manutenção + Manitol.\n3) ⛔ PROIBIDO MELOXICAM nas primeiras 48–72h (necrose tubular aguda fatal!).\n4) Analgesia potente (Metadona + Dipirona + Gabapentina) + cobertura p/ necrose (Clindamicina/Amoxi+Clav + Metronidazol).",
    focoDrogas: ["Metadona", "Gabapentina", "Dipirona", "Furosemida", "Manitol 20%", "Clindamicina", "Metronidazol"],
    bloqueiaMelox: true, pedePesoMagro: false
  },
  estase_gi: {
    label: "🤢 Vômito / Diarreia / Estase GI",
    palavras: ["vomito", "vômito", "diarreia", "regurgit", "estase", "timpanismo", "inapetencia"],
    conduta: "1) Maropitant (Cerenia® 1 mg/kg SC/IV q24h) + reposição hidroeletrolítica.\n2) ⛔ Suspender AINEs em caso de vômito/diarreia/desidratação!\n3) Em Coelhos/Roedores com Estase Cecal: hidratação (80 mL/kg/d) + analgesia + alimentação assistida se descartada obstrução (Textbook of Rabbit Medicine).",
    focoDrogas: ["Maropitant", "Dipirona", "Metronidazol"],
    bloqueiaMelox: true, pedePesoMagro: false
  },
  intoxicacao: {
    label: "🧪 Intoxicação (Chumbinho / Raticida)",
    palavras: ["chumbinho", "organofosforado", "carbamato", "raticida", "cumarinico", "veneno", "sialorreia", "miose"],
    conduta: "1) Síndrome Colinérgica (Sialorreia + Miose + Fasciculações = Chumbinho): Atropina em dose de antídoto (0,2 a 0,5 mg/kg — 1/4 IV e 3/4 IM) + Midazolam se convulsão.\n2) Raticida Anticoagulante (Hemorragias / Brodifacoum): Vitamina K1 (2,5 mg/kg SC/VO q12h por 21–28 dias!).",
    focoDrogas: ["Vitamina K1", "Midazolam", "Maropitant"],
    bloqueiaMelox: true, pedePesoMagro: false
  },
  renal_obstrucao: {
    label: "💧 Doença Renal / Obstrução Uretral / Gota",
    palavras: ["renal", "azotemia", "ureia", "creatinina", "obstrucao uretral", "dtuif", "gota", "acido urico"],
    conduta: "1) Em Mamíferos (DRC / IRA / DTUIF): Fluidoterapia guiada + correção de hipercalemia + Maropitant + analgesia sem AINE (Dipirona / Butorfanol / Metadona).\n2) Em Aves e Répteis (Hiperuricemia / Gota Úrica Visceral ou Articular — Sistema Urinário de Répteis): Hidratação agressiva (banhos mornos + fluido SC/IV/IO) + Alopurinol (15–20 mg/kg VO) + analgesia (Meloxicam é proibido na falência renal!).",
    focoDrogas: ["Maropitant", "Dipirona", "Butorfanol"],
    bloqueiaMelox: true, pedePesoMagro: false
  },
  pododermatite: {
    label: "🦶 Pododermatite (Bumblefoot)",
    palavras: ["bumblefoot", "pododermatite", "coxim", "planta do pe", "jarrete"],
    conduta: "1) Classificação de Grau I a V (Raptor Medicine - Scott / BSAVA Rabbit).\n2) Desbridamento sob anestesia + cultura + bandagem acolchoada aliviando pressão plantar (Donut / bola de gaze) + correção de poleiros.\n3) Antibiótico com penetração óssea/tendínea: Clindamicina (100 mg/kg em aves; 11 mg/kg em carnívoros), Amoxicilina+Clavulanato ou Marbofloxacina/Enrofloxacina + Meloxicam.",
    focoDrogas: ["Clindamicina", "Amoxicilina+Clav", "Meloxicam", "Tramadol"],
    bloqueiaMelox: false, pedePesoMagro: false
  },
  distocia_ovo: {
    label: "🥚 Retenção de Ovo / Distocia",
    palavras: ["ovo", "distocia", "postura", "prolapso", "cloaca"],
    conduta: "1) Estabilização térmica e metabólica ANTES de manipular: aquecer a 28–30 °C + umidade 70% + Gluconato de Cálcio 10% (50–100 mg/kg SC/IM diluído) + Fluidoterapia SC.\n2) Analgesia (Butorfanol + Meloxicam) + lubrificação cloacal.\n3) Se não houver obstrução mecânica/ovo aderido ou ectópico no RX: Ocitocina (Répteis: 5–10 UI/kg IM) ou Prostaglandina E2 intracloacal / ovocentese guiada (Tully / Patologia de Répteis).",
    focoDrogas: ["Butorfanol", "Meloxicam", "Amoxicilina+Clav"],
    bloqueiaMelox: false, pedePesoMagro: false
  },
  dom_hipocalcemia: {
    label: "🦴 Doença Osteometabólica (DOM / Hipocalcemia)",
    palavras: ["osteometabolica", "dom", "hipocalcemia", "raquitismo", "fratura patologica", "carapaca mole"],
    conduta: "1) Reposição de Cálcio: Gluconato de Cálcio 10% (100 mg/kg SC/IM diluído q12–24h na crise; depois Carbonato de Cálcio oral).\n2) Exposição obrigatória à radiação UVB (290–320 nm) + correção da relação Ca:P na dieta (2:1).\n3) Em Primatas Neotropicais (Saguis/Micos): suplementar especificamente Vitamina D3 (Colecalciferol — não absorvem D2!).",
    focoDrogas: ["Tramadol", "Dipirona", "Gabapentina"],
    bloqueiaMelox: false, pedePesoMagro: false
  }
};

// 7. BULÁRIO MULTI-FONTE DE 20 FÁRMACOS (COM MÚLTIPLOS FRASCOS, COMPRIMIDOS E GOTAS)
// Ordem dos 20 Táxons em dosesPadrao:
// 0:Cao, 1:Gato, 2:Gamba, 3:Columbiformes, 4:Passeriformes, 5:Psittaciformes, 6:Ramphastidae,
// 7:Strigiformes, 8:RapinantesDiurnos, 9:Cathartiformes, 10:Pernaltas, 11:Coelhos,
// 12:Caviomorfos, 13:Miomorfos, 14:Tamandua, 15:Tatu, 16:Primatas, 17:CarnivorosSilv, 18:Testudines, 19:Serpentes
const FARMACOS_DB = [
  {
    id: "Amoxicilina+Clav", nome: "Amoxicilina + Clavulanato", comercial: "Synulox®, Clavulin®, Agemoxi CL®",
    apres: "Susp. Oral 50 mg/mL (250 mg/5 mL)", conc: 50,
    frascos: [
      { label: "Susp. Oral 50 mg/mL (250mg/5mL)", conc: 50 },
      { label: "Susp. Forte 80 mg/mL (400mg/5mL)", conc: 80 },
      { label: "Injetável 175 mg/mL (Synulox® RTU)", conc: 175 }
    ],
    compMg: [50, 250, 500], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [15, 15, 15, 125, 125, 125, 100, 125, 125, 100, 125, 0, 0, 20, 15, 15, 15, 15, 22, 22],
    resumoBulario: "Beta-lactâmico associado a inibidor de beta-lactamase. 1ª escolha empírica em feridas traumáticas, abscessos e mordeduras de felinos (Pasteurella multocida). ESTRITAMENTE PROIBIDO por via oral em Coelhos, Cobaias, Chinchilas e Ouriço-cacheiro (enterotoxemia letal por Clostridium). Seguro por via oral em Ratos (Rattus).",
    faixasPorGrupo: {
      Gato: { opcoes: [12.5, 15, 20], via: "VO ou SC q12h (BID) por 7 a 10 dias", badge: "⭐ 1ª Escolha Feridas / Pasteurella", status: "seguro",
        fontes: [
          ["Plumb's Veterinary Drug Handbook — 10ª Ed., p. 73–76", "Cats: Skin and soft tissue infections (Pasteurella, Staphylococcus, anaerobes): 12.5–20 mg/kg PO q12h.", "📖 Conferido na Fonte"],
          ["Manual Saunders de Terapia Veterinária (Papich) & Crivellenti", "12,5 a 25 mg/kg BID VO/SC por 7 a 10 dias.", "📖 Conferido na Fonte"]
        ]
      },
      Aves: { opcoes: [100, 125, 150], via: "VO q8–12h (BID/TID)", badge: "⭐ 1ª Escolha Ataque de Gato / Feridas", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 245", "Psittacines, Columbiformes, Passerines & Raptors: 125–150 mg/kg PO q8–12h. First-line for cat-bite wounds.", "📖 Conferido na Fonte"],
          ["Raptor Medicine, Surgery and Rehabilitation (Scott, p. 295)", "125 mg/kg PO BID for soft tissue infections and pododermatitis.", "📖 Conferido na Fonte"],
          ["Tully — Clínica de Aves (2ª Ed.) & Tratado (Cubas, p. 319)", "Aves: 100 a 150 mg/kg VO a cada 8 a 12h.", "📖 Conferido na Fonte"]
        ]
      },
      ProibidoCeco: { opcoes: [0], via: "⛔ PROIBIDO POR VIA ORAL!", badge: "⛔ LETAL (Enterotoxemia por Clostridium!)", status: "proibido",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 475 & 526", "CONTRAINDICATED orally in Rabbits, Guinea Pigs, and Chinchillas (fatal clostridial enterotoxemia).", "📖 Conferido na Fonte"],
          ["Textbook of Rabbit Medicine (2ª Ed.) & BSAVA Rabbit Surgery", "Oral beta-lactams cause fatal dysbiosis in lagomorphs.", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [12.5, 15, 22], via: "VO, SC ou IM q12h (Répteis: 22 mg/kg q12–24h)", badge: "🟢 Amplo Espectro / Tecidos Moles", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 104, 526, 599", "Rats (Miomorpha): 20 mg/kg PO q12h. Marsupials/Xenarthra/Primates: 12.5–20 mg/kg q12h. Reptiles: 22 mg/kg q12–24h.", "📖 Conferido na Fonte"]
        ]
      }
    }
  },
  {
    id: "Clindamicina", nome: "Clindamicina", comercial: "Dalacin C®, Clindamin-C®",
    apres: "Sol. Oral / Inj. 25 mg/mL", conc: 25,
    frascos: [
      { label: "Sol. Oral / Veterinária 25 mg/mL", conc: 25 },
      { label: "Ampola Hospitalar 150 mg/mL", conc: 150 }
    ],
    compMg: [75, 150, 300], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [11, 11, 11, 100, 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 11, 11, 11, 11, 5, 5],
    resumoBulario: "Lincosamida de altíssima penetração em tecido necrótico, miíase, abscessos caseosos, osteomielite, pododermatite (Bumblefoot) e cavidade oral (anaeróbios e Gram+). Em Gatos, dar água após administração oral para evitar esofagite/estenose. LETAL em Coelhos e Roedores!",
    faixasPorGrupo: {
      Gato: { opcoes: [5.5, 11, 15], via: "VO ou SC q12h (Dar 5 mL de água após VO p/ evitar esofagite!)", badge: "⭐ Excelente p/ Miíase, Necrose e Osteomielite", status: "seguro",
        fontes: [
          ["Plumb's Veterinary Drug Handbook — 10ª Ed., p. 265–268", "Cats: Abscesses, necrotic wounds, osteomyelitis: 11 mg/kg PO q12h (up to 15–25 mg/kg for Toxoplasma). Follow oral doses with water bolus.", "📖 Conferido na Fonte"],
          ["Manual Saunders (Papich) & Crivellenti", "11 mg/kg BID VO/SC/IM.", "📖 Conferido na Fonte"]
        ]
      },
      Aves: { opcoes: [50, 100], via: "VO q12h (BID)", badge: "🟢 Osteomielite / Bumblefoot / Necrose", status: "seguro",
        fontes: [
          ["Raptor Medicine, Surgery and Rehabilitation (Scott, p. 237, 246–247)", "Clindamycin: 100 mg/kg PO q12h in raptors for osteomyelitis and severe pododermatitis.", "📖 Conferido na Fonte"],
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 248", "Birds: 100 mg/kg PO q12h.", "📖 Conferido na Fonte"]
        ]
      },
      ProibidoCeco: { opcoes: [0], via: "⛔ PROIBIDO EM COELHOS E ROEDORES!", badge: "⛔ 100% LETAL (Enterotoxemia Fulminante)", status: "proibido",
        fontes: [
          ["BSAVA Manual of Rodents and Ferrets & Carpenter 6ª Ed., p. 475", "Strictly contraindicated in Lagomorphs and Rodents (fatal clostridial enterotoxemia).", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [5.5, 11, 15], via: "VO, SC ou IM q12h (Répteis: 5 mg/kg q24h)", badge: "🟢 Anaeróbios / Feridas Necróticas", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 105, 599", "Dogs & Wild Carnivores: 11 mg/kg q12h. Marsupials: 5.5–11 mg/kg q12h. Reptiles: 5 mg/kg PO, IM q24h.", "📖 Conferido na Fonte"]
        ]
      }
    }
  },
  {
    id: "Enrofloxacina", nome: "Enrofloxacina", comercial: "Baytril®, Flotril®, Enropet®",
    apres: "Injetável / Oral 2,5% (25 mg/mL)", conc: 25,
    frascos: [
      { label: "Frasco 2,5% (25 mg/mL — Pequenos/Silvestres)", conc: 25 },
      { label: "Frasco 5,0% (50 mg/mL)", conc: 50 },
      { label: "Frasco 10% (100 mg/mL — Grandes)", conc: 100 }
    ],
    compMg: [15, 50, 150], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [5, 5, 5, 15, 15, 15, 15, 15, 15, 15, 15, 10, 10, 10, 5, 5, 5, 5, 5, 5],
    resumoBulario: "Fluoroquinolona bactericida concentração-dependente (Gram-negativos e Mycoplasma). EM GATOS: polimorfismo no transportador ABCG2 na barreira hematorretiniana causa degeneração fotorreceptora e CEGUEIRA IRREVERSÍVEL (evitar como 1ª escolha; nunca exceder 5 mg/kg SID). Em Aves e Pequenos Mamíferos: pH alcalino causa necrose se injetada pura — diluir 1:4 em NaCl 0,9% para via SC ou usar VO!",
    faixasPorGrupo: {
      Gato: { opcoes: [2.5, 5.0], via: "⚠️ MÁXIMO 5 mg/kg SID (q24h) — Evitar IV! Preferir Marbofloxacina ou Amoxi+Clav", badge: "⚠️ RISCO DE CEGUEIRA RETINIANA (Evitar 1ª Escolha!)", status: "alerta",
        fontes: [
          ["Plumb's Veterinary Drug Handbook — 10ª Ed., p. 451–454 (Black Box Felino)", "RETINAL TOXICITY IN CATS: Feline ABCG2 efflux defect causes acute photoreceptor degeneration and blindness. Max 5 mg/kg/day; blindness can occur even at <= 5 mg/kg in dehydrated/renal-impaired cats. Prefer Pradofloxacin or Marbofloxacin.", "📖 Conferido na Fonte"],
          ["Manual Saunders (Papich) & Spinosa (6ª Ed.)", "Retinotoxicidade dose-dependente e idiossincrática em felinos domésticos e silvestres.", "📖 Conferido na Fonte"]
        ]
      },
      Aves: { opcoes: [10, 15], via: "VO ou SC diluído 1:4 em NaCl 0,9% q12h (Evitar IM repetido no peito!)", badge: "🟡 Gram-Negativos / Respiratório (Diluir no SC)", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 250–251", "Psittacines, Columbiformes, Passerines & Raptors: 10–15 mg/kg PO, SC q12h. Repeated IM injections cause severe pectoral muscle necrosis.", "📖 Conferido na Fonte"],
          ["Raptor Medicine (Scott, p. 297) & Tully (2ª Ed.)", "15 mg/kg PO, SC q12h (dilute in saline for SC).", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [5, 10], via: "Mamíferos: 5 mg/kg SID/BID | Coelhos/Roedores: 10 mg/kg BID diluído | Répteis: 5–10 mg/kg q24–48h", badge: "🟢 Diluir 1:4 em NaCl 0,9% p/ via SC", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 106, 476, 531, 575", "Rabbits & Rodents: 10–15 mg/kg PO, SC (diluted) q12h. Reptiles: 5–10 mg/kg PO, SC, IM (forelimbs) q24–48h.", "📖 Conferido na Fonte"]
        ]
      }
    }
  },
  {
    id: "Marbofloxacina", nome: "Marbofloxacina (Substituto Seguro em Gatos)", comercial: "Marbopet®, Zeniquin®, Marbocyl®",
    apres: "Injetável 20 mg/mL (2%) | Comp. 2,75 mg, 5,5 mg, 27,5 mg", conc: 20,
    frascos: [
      { label: "Injetável 2% (20 mg/mL)", conc: 20 },
      { label: "Injetável 10% (100 mg/mL)", conc: 100 }
    ],
    compMg: [2.75, 5.5, 27.5, 82.5], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [2.75, 2.75, 4.0, 10, 10, 10, 10, 10, 10, 10, 10, 5, 5, 5, 4, 4, 4, 2.75, 10, 10],
    resumoBulario: "Fluoroquinolona de 3ª geração veterinária. É O SUBSTITUTO DE ESCOLHA DA ENROFLOXACINA EM GATOS (possui afinidade drasticamente menor pela retina felina e excelente eliminação) e excelente opção em Coelhos, Roedores, Aves e Répteis sem causar a necrose tecidual severa da enrofloxacina.",
    faixasPorGrupo: {
      Gato: { opcoes: [2.75, 5.5], via: "VO ou SC a cada 24h (SID)", badge: "⭐ Fluoroquinolona Segura em Gatos (Sem Risco Retiniano da Enro)", status: "seguro",
        fontes: [
          ["Plumb's Veterinary Drug Handbook — 10ª Ed., p. 758–760 & Papich", "Cats: 2.75–5.5 mg/kg PO q24h. Much lower risk of retinal toxicity compared to enrofloxacin.", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [2.75, 5.0, 10.0], via: "Cães: 2,75–5,5 mg/kg SID | Coelhos/Roed: 5 mg/kg SID | Aves/Répteis: 10 mg/kg SID", badge: "🟢 Fluoroquinolona de Alta Segurança Tecidual", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 107, 252, 477", "Birds & Reptiles: 10 mg/kg q24h. Rabbits & Rodents: 5 mg/kg PO, SC q24h.", "📖 Conferido na Fonte"]
        ]
      }
    }
  },
  {
    id: "Ceftazidima", nome: "Ceftazidima (Padrão-Ouro Répteis/Aves)", comercial: "Fortaz®, Ceftazidima 1g",
    apres: "Pó Liofilizado reconstituído a 100 mg/mL (1g + 9,2 mL AD)", conc: 100,
    frascos: [
      { label: "Reconstituído Padrão 100 mg/mL", conc: 100 },
      { label: "Diluído 1:10 p/ Pequenos (10 mg/mL)", conc: 10 }
    ],
    compMg: [], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [25, 25, 25, 75, 75, 75, 75, 75, 75, 75, 75, 25, 25, 25, 20, 20, 25, 25, 20, 20],
    resumoBulario: "Cefalosporina de 3ª geração bactericida com excelente ação contra Pseudomonas aeruginosa e Gram-negativos. É O ANTIBIÓTICO INJETÁVEL DE 1ª ESCOLHA EM RÉPTEIS (aplicado apenas a cada 72 horas nos membros anteriores / terço cranial!) e em sepse aviária.",
    faixasPorGrupo: {
      Aves: { opcoes: [50, 75, 100], via: "IM ou IV a cada 8 a 12h", badge: "🟢 Sepse / Pseudomonas em Aves", status: "seguro",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 247 & Tully", "Birds: 50–100 mg/kg IM, IV q8–12h.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [20, 25], via: "Répteis: 20 mg/kg IM/SC a cada 72 HORAS (3 dias)! | Mamíferos: 25 mg/kg q8–12h", badge: "⭐ 1ª Escolha Injetável em Répteis (A cada 72h!)", status: "seguro",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 105 & Patologia de Répteis", "Chelonians, Snakes & Lizards: 20 mg/kg IM, SC (cranial half) every 72 hours (maintain in POTZ).", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Doxiciclina", nome: "Doxiciclina", comercial: "Doxitrat®, Doxifin®, Vibramicina®",
    apres: "Susp. / Sol. 10 mg/mL", conc: 10,
    frascos: [
      { label: "Suspensão Oral 10 mg/mL", conc: 10 },
      { label: "Injetável L.A. Aviário 50 mg/mL", conc: 50 }
    ],
    compMg: [40, 80, 100, 200], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [10, 10, 5, 35, 40, 35, 35, 35, 35, 35, 35, 5, 5, 5, 5, 5, 5, 10, 25, 10],
    resumoBulario: "Tetraciclina lipofílica de escolha para Clamidiose aviária (Chlamydia psittaci — 45 dias), Micoplasmose respiratória (aves, ratos e jabutis) e Hemoparasitoses (Ehrlichia / Mycoplasma haemofelis). Em Gatos, NUNCA dar comprimido a seco (causa úlcera e estenose esofágica severa!).",
    faixasPorGrupo: {
      Gato: { opcoes: [5, 10], via: "VO q12–24h (SEMPRE administrar 5 mL de água após o comprimido!)", badge: "🟡 Dar Água Após VO (Risco de Estenose Esofágica!)", status: "seguro",
        fontes: [["Casos de Rotina (Crivellenti 2ª Ed.) & Plumb's 10ª Ed.", "Gatos: 5 mg/kg BID ou 10 mg/kg SID VO seguido de água/alimento.", "📖 Conferido na Fonte"]]
      },
      Aves: { opcoes: [25, 35, 40, 50], via: "VO q12–24h (Reduzir cálcio/grit mineral na dieta pois quela a doxiciclina!)", badge: "⭐ 1ª Escolha p/ Clamidiose e Micoplasmose Aviária", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 249–250", "Psittacines, Columbiformes & Passerines: 25–50 mg/kg PO q12–24h.", "📖 Conferido na Fonte"],
          ["Raptor Medicine (Scott, p. 297) & Blackwell's Avian", "Doxycycline: 35–50 mg/kg PO q12–24h.", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [5, 10, 25], via: "Mamíf/Roed/Coelhos: 5–10 mg/kg BID | Quelônios: 50 mg/kg ataque -> 25 mg/kg IM q72h", badge: "🟢 Micoplasmose / Hemoparasitas / Respiratório", status: "seguro",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 106, 530, 579", "Rats: 5 mg/kg PO q12h. Chelonians: 50 mg/kg IM once, then 25 mg/kg q72h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Metronidazol", nome: "Metronidazol", comercial: "Flagyl®, Helmizol®, Giardicid®",
    apres: "Injetável 5 mg/mL (0,5%)", conc: 5,
    frascos: [
      { label: "Bolsa Injetável 0,5% (5 mg/mL)", conc: 5 },
      { label: "Suspensão Pediátrica 4% (40 mg/mL)", conc: 40 }
    ],
    compMg: [50, 250, 400, 500], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [15, 10, 15, 25, 25, 25, 25, 25, 25, 25, 25, 20, 20, 20, 15, 15, 15, 15, 20, 20],
    resumoBulario: "Bactericida contra anaeróbios obrigatórios (feridas necróticas, cavidade oral, peritonite, choque elétrico) e antiprotozoário (Giardia, Trichomonas gallinae em pombos e rapinantes, Entamoeba em répteis). Doses altas causam neurotoxicidade vestibular central.",
    faixasPorGrupo: {
      Gato: { opcoes: [10, 15], via: "IV lento ou VO q12h (Máx 25 mg/kg/dia)", badge: "🟢 Anaeróbios / Giardia / Necrose", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 824 & Crivellenti", "Cats: 10–15 mg/kg q12h. Avoid > 25–30 mg/kg/day (central vestibular neurotoxicity).", "📖 Conferido na Fonte"]]
      },
      Aves: { opcoes: [25, 50], via: "VO q12h por 5 a 7 dias", badge: "⭐ Tricomoníase (Pombos/Rapinantes) & Anaeróbios", status: "seguro",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 253 & 265", "Birds: 25–50 mg/kg PO q12h.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [15, 20, 25], via: "VO ou IV lento q12h (Répteis: 20 mg/kg VO q24–48h)", badge: "🟢 Anaeróbios e Protozoários", status: "seguro",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 107, 478, 600", "Rabbits/Rodents: 20 mg/kg PO q12h. Reptiles: 20 mg/kg PO q24–48h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Dipirona", nome: "Dipirona Sódica", comercial: "Novalgina®, D-500®, Algivet®",
    apres: "Injetável / Gotas 500 mg/mL (50%)", conc: 500,
    frascos: [
      { label: "Injetável / Gotas 500 mg/mL (50%)", conc: 500 },
      { label: "Solução Oral Infantil 50 mg/mL (5%)", conc: 50 }
    ],
    compMg: [500, 1000], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [25, 15, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
    resumoBulario: "Analgésico não-opioide (ação central, canabinoide/opioide endógena e espasmolítica visceral) e antitérmico seguro mesmo quando AINEs clássicos estão bloqueados. Como o frasco tem 500 mg/mL, em animais abaixo de 2 kg usar obrigatoriamente a Diluição 1:10 ou a Solução Infantil 50 mg/mL!",
    faixasPorGrupo: {
      Gato: { opcoes: [12.5, 15, 25], via: "IV lento, SC ou VO a cada 12–24h", badge: "⭐ Analgésico & Antitérmico Seguro (Mesmo na Efusão/DRC)", status: "seguro",
        fontes: [
          ["Spinosa — Farmacologia Aplicada à Medicina Veterinária (6ª Ed., p. 304–306)", "Felinos: 12,5 a 25 mg/kg a cada 12 a 24 horas.", "📖 Conferido na Fonte"],
          ["Casos de Rotina (Crivellenti 2ª Ed., p. 106, 167)", "Gatos: 15–25 mg/kg q12–24h; Cães: 25 mg/kg q8h.", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [20, 25, 35], via: "IV lento, IM, SC ou VO q8–12h", badge: "🟢 Analgesia Visceral/Somática (Diluir 1:10 se < 2 kg!)", status: "seguro",
        fontes: [
          ["Tratado de Animais Selvagens (Cubas et al., p. 308, 325) & Carpenter 6ª Ed., p. 113, 293, 545", "Mamíferos silvestres, Marsupiais, Xenarthra e Aves: 25 mg/kg q8–12h.", "📖 Conferido na Fonte"]
        ]
      }
    }
  },
  {
    id: "Meloxicam", nome: "Meloxicam", comercial: "Maxicam®, Metacam®, Flamavet®",
    apres: "Injetável 0,2% (2 mg/mL)", conc: 2,
    frascos: [
      { label: "Injetável 0,2% (2 mg/mL — Cães/Gatos/Silvestres)", conc: 2 },
      { label: "Susp. Oral Gatos 0,05% (0,5 mg/mL)", conc: 0.5 },
      { label: "Susp. Oral Cães 0,15% (1,5 mg/mL)", conc: 1.5 },
      { label: "Injetável 2,0% (20 mg/mL — Grandes)", conc: 20 }
    ],
    compMg: [0.5, 1.0, 2.0, 4.0], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [0.1, 0.05, 0.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 1.0, 0.1, 0.1, 0.15, 0.1, 0.2, 0.2],
    resumoBulario: "AINE seletivo COX-2. Em Aves (1 mg/kg BID) e Coelhos/Roedores (0,5–1 mg/kg), o metabolismo hepático rápido exige doses mais altas que em cães/gatos. É o ÚNICO AINE seguro em Urubus e Aves de Rapina! Bloqueado em pacientes desidratados, hipotensos, ascíticos, nefropatas, com vômito/diarreia ou choque elétrico.",
    faixasPorGrupo: {
      Gato: { opcoes: [0.05, 0.1], via: "SC ou VO q24h (0,1 mg/kg no Dia 1 -> 0,05 mg/kg manutenção)", badge: "🟡 Apenas se Normohidratado e sem Ascite/Vômito", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 791 & Crivellenti", "Cats: 0.1 mg/kg day 1, then 0.05 mg/kg q24h. Contraindicated in dehydrated/ascitic/renal cats.", "📖 Conferido na Fonte"]]
      },
      Aves: { opcoes: [0.5, 1.0, 1.5], via: "VO, IM ou SC q12h (BID) — Único AINE seguro em Rapinantes e Urubus!", badge: "⭐ AINE Nº 1 em Aves (1 mg/kg BID)", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 114–115, 293–294", "Psittacines, Columbiformes, Passerines & Raptors: 1.0 mg/kg PO, IM, SC q12h. Safe in vultures (1–2 mg/kg).", "📖 Conferido na Fonte"],
          ["Raptor Medicine (Scott, p. 298) & Tully (2ª Ed.)", "Meloxicam: 1–2 mg/kg PO, IM, SC q12h.", "📖 Conferido na Fonte"]
        ]
      },
      Coelhos: { opcoes: [0.5, 1.0], via: "VO ou SC q12–24h", badge: "⭐ Dose Alta em Coelhos e Roedores (0,5 a 1 mg/kg)", status: "seguro",
        fontes: [["Carpenter 6ª Ed., p. 545, 586 & Textbook of Rabbit Medicine (2ª Ed.)", "Rabbits & Rodents: 0.5–1.0 mg/kg PO, SC q12–24h.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [0.1, 0.2], via: "SC, IV ou VO q24h (Em Gambás: máx 3 dias!)", badge: "🟡 Só aplicar após reidratação completa!", status: "seguro",
        fontes: [["Carpenter 6ª Ed., p. 79, 132 & Fowler Vol. 10", "Dogs/Carnivores: 0.1–0.2 mg/kg q24h. Marsupials/Xenarthra: 0.1 mg/kg (max 3d). Reptiles: 0.2 mg/kg q24h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Tramadol", nome: "Tramadol", comercial: "Tramal®, Cronidor®",
    apres: "Injetável / Gotas 50 mg/mL", conc: 50,
    frascos: [
      { label: "Injetável 50 mg/mL", conc: 50 },
      { label: "Gotas Orais 100 mg/mL (40 gts/mL)", conc: 100 },
      { label: "Susp. Veterinária 2% (20 mg/mL)", conc: 20 }
    ],
    compMg: [12, 40, 50, 100], gotasMl: 40, usoReceita: "uso veterinário",
    dosesPadrao: [3, 2, 2, 10, 10, 10, 10, 8, 8, 10, 10, 10, 10, 10, 2, 2, 3, 3, 5, 5],
    resumoBulario: "Agonista mu fraco + inibidor da recaptação de serotonina e noradrenalina. Excelente opção analgésica em Répteis (Quelônios e Serpentes: 5–10 mg/kg q24–48h, onde a morfina/fentanil falham!), Aves (8 a 15 mg/kg BID) e Mamíferos.",
    faixasPorGrupo: {
      Aves: { opcoes: [5, 8, 10, 15], via: "VO ou IM q12h", badge: "🟢 Analgesia Multimodal Aviária", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 172, 277", "Raptors: 5–11 mg/kg PO q12h; Psittacines/Pigeons: 10–30 mg/kg PO q12h.", "📖 Conferido na Fonte"],
          ["Raptor Medicine (Scott, p. 300)", "Tramadol: 5–10 mg/kg PO, IM q12h.", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [2, 3, 5, 10], via: "Mamíf: 2–4 mg/kg q8–12h | Coelhos/Roed: 10 mg/kg | Répteis: 5–10 mg/kg q24–48h", badge: "⭐ 1ª Escolha Opioide em Répteis (Quelônios/Serpentes)", status: "seguro",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 133, 545 & BSAVA Rabbit Surgery, p. 145", "Reptiles: 5–10 mg/kg PO, SC, IM q48–72h. Dogs/Cats: 2–4 mg/kg.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Gabapentina", nome: "Gabapentina (Dor Neuropática / Fear-Free)", comercial: "Neurontin®, Gabaneurin®",
    apres: "Manipulado / Sol. Oral 50 mg/mL", conc: 50,
    frascos: [
      { label: "Suspensão Manipulada 50 mg/mL", conc: 50 },
      { label: "Suspensão Manipulada 20 mg/mL", conc: 20 }
    ],
    compMg: [50, 100, 300, 400], gotasMl: 20, usoReceita: "manipulado",
    dosesPadrao: [10, 10, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 10, 10, 10, 10, 10, 10],
    resumoBulario: "Modulador de canais de cálcio alfa-2-delta. Indispensável na dor neuropática (choque elétrico, trauma medular, amputação, automutilação em aves e primatas) e como ansiolítico pré-consulta em gatos (50–100 mg/gato 2h antes do manejo).",
    faixasPorGrupo: {
      Gato: { opcoes: [5, 10, 20], via: "Dor Crônica/Neuropática: 5–10 mg/kg VO q8–12h | Ansiolítico Pré-Manejo: 10–20 mg/kg (50 a 100 mg/gato) 2h antes", badge: "⭐ Analgesia Neuropática & Contenção Fear-Free Felina", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 556 & Manual Saunders (Papich)", "Cats: Analgesia 5–10 mg/kg PO q8–12h; Pre-visit anxiolysis/sedation: 10–20 mg/kg (typically 50–100 mg/cat) PO 1.5–2h prior.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [10, 15, 25], via: "VO a cada 8 a 12h", badge: "🟢 Dor Neuropática / Choque Elétrico / Automutilação", status: "seguro",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 295, 496", "Birds (self-mutilation/neuropathic pain): 10–25 mg/kg PO q8–12h. Rabbits & Mammals: 10–15 mg/kg PO q8–12h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Butorfanol", nome: "Butorfanol", comercial: "Torbugesic® 10 mg/mL",
    apres: "Injetável 10 mg/mL", conc: 10,
    frascos: [{ label: "Frasco Padrão 10 mg/mL", conc: 10 }],
    compMg: [], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [0.3, 0.3, 0.4, 2.0, 2.0, 2.0, 1.5, 2.0, 1.0, 1.5, 1.5, 0.5, 1.0, 1.0, 0.2, 0.2, 0.3, 0.2, 1.0, 1.0],
    resumoBulario: "Agonista Kappa / Antagonista Mu. É o OPIOIDE DE 1ª ESCOLHA EM AVES (predomínio de receptores Kappa no SNC aviário) e o sedativo de escolha na dispneia/edema pulmonar em cães e gatos. Ineficaz por via oral em aves.",
    faixasPorGrupo: {
      Aves: { opcoes: [0.5, 1.0, 2.0, 3.0], via: "IM ou IV a cada 4–6h (Em Falcões: usar 0,2–0,5 mg/kg!)", badge: "⭐ Opioide Nº 1 para Aves (Agonista Kappa)", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 282–283", "Psittacines, Columbiformes & Passerines: 1–3 mg/kg IM q4–6h.", "📖 Conferido na Fonte"],
          ["Raptor Medicine (Scott, p. 296) & Falcon Husbandry", "Owls & Hawks: 1–2 mg/kg IM, IV. Falcons (Falco spp.): 0.1–0.6 mg/kg (higher doses cause motor dysphoria).", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [0.2, 0.3, 0.5, 1.0], via: "IM, IV ou SC a cada 4–6h", badge: "🟢 Sedação Respiratória (Dispneia) e Co-indução", status: "seguro",
        fontes: [["Carpenter 6ª Ed., p. 75, 540, 589 & Silverstein 3ª Ed.", "Dogs/Cats: 0.2–0.4 mg/kg. Rabbits/Rodents: 0.5–1.0 mg/kg.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Metadona", nome: "Metadona", comercial: "Mytedom® 10 mg/mL",
    apres: "Injetável 10 mg/mL", conc: 10,
    frascos: [{ label: "Ampola 10 mg/mL", conc: 10 }],
    compMg: [5, 10], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [0.2, 0.2, 0.2, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 0.15, 0.15, 0.2, 0.2, 1.0, 0],
    resumoBulario: "Agonista opioide Mu puro + Antagonista NMDA (excelente contra dor severa, politrauma, miíase extensa, choque elétrico e hiperalgesia). Não provoca vômito como a morfina, sendo seguro no TCE e trauma ocular!",
    faixasPorGrupo: {
      Padrao: { opcoes: [0.1, 0.2, 0.3, 0.5, 1.0], via: "IM, SC ou IV lento a cada 4–6h", badge: "⭐ Dor Severa / Trauma / TCE / Choque Elétrico", status: "seguro",
        fontes: [
          ["Plumb's Veterinary Drug Handbook — 10ª Ed., p. 808–810", "Dogs & Cats: 0.1–0.5 mg/kg IM, IV, SC q4–6h. Mu-agonist + NMDA antagonist.", "📖 Conferido na Fonte"],
          ["Small Animal Critical Care Medicine (Silverstein 3ª Ed.)", "Opioide de 1ª escolha no politrauma e TCE.", "📖 Conferido na Fonte"]
        ]
      }
    }
  },
  {
    id: "Midazolam", nome: "Midazolam", comercial: "Dormonid® 5 mg/mL",
    apres: "Injetável 5 mg/mL", conc: 5,
    frascos: [
      { label: "Ampola 5 mg/mL (15mg/3mL ou 50mg/10mL)", conc: 5 },
      { label: "Ampola 1 mg/mL (5mg/5mL)", conc: 1 }
    ],
    compMg: [7.5, 15], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [0.3, 0.3, 0.5, 2.0, 2.0, 2.0, 1.5, 1.5, 1.0, 1.5, 1.5, 1.0, 1.0, 1.0, 0.3, 0.4, 0.4, 0.3, 1.5, 1.5],
    resumoBulario: "Benzodiazepínico hidrossolúvel (absorção IM e Intranasal rápida e indolor). 1ª linha no controle imediato de convulsões (Status epilepticus) e base da contenção química em aves, répteis e pequenos mamíferos. Reversor específico: Flumazenil (0,05 mg/kg).",
    faixasPorGrupo: {
      Aves: { opcoes: [1.0, 1.5, 2.0], via: "IM ou Intranasal (Reversor: Flumazenil 0,05 mg/kg IM)", badge: "⭐ Sedativo Antiestresse e Anticonvulsivante Aviário", status: "seguro",
        fontes: [
          ["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 283 & Longley (Anesthesia)", "Birds: 1–2 mg/kg IM or Intranasal for sedation, restraint, and seizures.", "📖 Conferido na Fonte"],
          ["Raptor Medicine (Scott, p. 296)", "Midazolam 1–2 mg/kg IM/IV is the safest sedative backbone in owls and raptors.", "📖 Conferido na Fonte"]
        ]
      },
      Padrao: { opcoes: [0.2, 0.3, 0.5, 1.0, 1.5], via: "IV, IM ou Intranasal", badge: "🟢 1ª Linha na Convulsão Ativa & Co-indutor", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 843 & West 3ª Ed.", "Seizures: 0.2–0.5 mg/kg IV/IM/IN. Exotic mammals & reptiles sedation: 0.5–1.5 mg/kg IM.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Cetamina", nome: "Cetamina", comercial: "Ketamin®, Dopalen®, Vetaset®",
    apres: "Injetável 10% (100 mg/mL)", conc: 100,
    frascos: [
      { label: "Frasco 10% (100 mg/mL)", conc: 100 },
      { label: "Frasco 5% (50 mg/mL — Dextrocetamina)", conc: 50 }
    ],
    compMg: [], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [3, 5, 10, 15, 20, 15, 15, 10, 10, 15, 15, 15, 20, 20, 8, 10, 8, 5, 15, 15],
    resumoBulario: "Anestésico dissociativo e antagonista NMDA (anti-hiperalgésico em microdoses). NUNCA utilizar isoladamente em nenhuma espécie (causa hipertonia muscular, catalepsia e recuperação violenta) — associar sempre a Midazolam e Opioide!",
    faixasPorGrupo: {
      Padrao: { opcoes: [0.5, 3, 5, 10, 15, 20], via: "IM ou IV (Associada a Midazolam + Opioide! Microdose analgésica: 0,5 mg/kg)", badge: "🟡 Dissociativo (Evitar no TCE Descompensado!)", status: "seguro",
        fontes: [["Zoo Animal and Wildlife Immobilization (West 3ª Ed.) & Carpenter 6ª Ed.", "Combine with benzodiazepine and opioid/alpha-2 for balanced chemical restraint.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Maropitant", nome: "Maropitant (Cerenia®)", comercial: "Cerenia® 10 mg/mL",
    apres: "Injetável 10 mg/mL", conc: 10,
    frascos: [{ label: "Frasco Injetável 10 mg/mL", conc: 10 }],
    compMg: [16, 24, 60, 160], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    resumoBulario: "Antagonista seletivo dos receptores NK-1 (bloqueia a Substância P no centro do vômito e aferentes vagais). Promove antiemese potente e analgesia visceral adjuvante. Manter o frasco refrigerado para reduzir dor na aplicação SC!",
    faixasPorGrupo: {
      Padrao: { opcoes: [1.0, 2.0], via: "SC ou IV lento (em 5–10 min) q24h (VO em cães: 2 mg/kg)", badge: "🟢 Antiemético Central/Periférico & Analgesia Visceral", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 764 & Carpenter 6ª Ed., p. 492", "Dogs, Cats, Rabbits & Exotic Mammals: 1 mg/kg SC or IV q24h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Furosemida", nome: "Furosemida", comercial: "Lasix® 10 mg/mL",
    apres: "Injetável 10 mg/mL", conc: 10,
    frascos: [{ label: "Ampola Injetável 10 mg/mL", conc: 10 }],
    compMg: [20, 40], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [2.0, 1.5, 2.0, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0],
    resumoBulario: "Diurético de alça de ação rápida para Edema Pulmonar Agudo (cardiogênico, neurogênico pós-choque elétrico ou pós-broncoaspiração) e hipercalemia. ATENÇÃO: Aves (0,15 a 0,5 mg/kg) e Gatos (1 a 2 mg/kg) são altamente sensíveis à desidratação e ototoxicidade!",
    faixasPorGrupo: {
      Aves: { opcoes: [0.15, 0.2, 0.5], via: "IM, SC ou IV q12–24h", badge: "⚠️ Dose Aviária Baixa (0,15 a 0,5 mg/kg!)", status: "alerta",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 308", "Birds: 0.15–0.5 mg/kg IM, SC, IV q12–24h. Overdosage causes rapid fatal dehydration.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [1.0, 1.5, 2.0, 4.0], via: "IV, IM, SC ou VO q8–12h (Gatos: iniciar com 1 a 2 mg/kg!)", badge: "🟢 Edema Pulmonar / Efusões / Hipercalemia", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 542 & Silverstein 3ª Ed.", "Cats: 1–2 mg/kg IV/IM. Dogs & Mammals: 2–4 mg/kg IV/IM.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Nitenpiram", nome: "Nitenpiram (Capstar®)", comercial: "Capstar® 11,4 mg e 57 mg",
    apres: "Comprimido Oral (Base 11,4 mg/unid)", conc: 11.4,
    frascos: [
      { label: "Comp. 11,4 mg diluído em 1 mL água (11,4 mg/mL)", conc: 11.4 },
      { label: "Comp. 57,0 mg diluído em 5 mL água (11,4 mg/mL)", conc: 11.4 }
    ],
    compMg: [11.4, 57.0], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0, 0],
    resumoBulario: "Neonicotinoide sistêmico de ação ultrarrápida (efeito knockdown em 30 a 60 minutos) para expulsão de larvas de MIÍASE (Cochliomyia hominivorax) e pulgas em cães, gatos, marsupiais e animais silvestres (VO ou diluído em água por via retal).",
    faixasPorGrupo: {
      Padrao: { opcoes: [1.0, 2.0], via: "VO (ou via retal diluído em água) a cada 24h por 1 a 3 dias", badge: "🐛 Expulsão Rápida de Larvas de Miíase (30–60 min!)", status: "seguro",
        fontes: [["Casos de Rotina (Crivellenti 2ª Ed.) & Plumb's 10ª Ed., p. 901", "Myiasis (screwworm/maggots): 1–2 mg/kg PO or rectally; rapid larval expulsion within 1–3 hours.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Manitol 20%", nome: "Manitol 20%", comercial: "Solução de Manitol 20% (200 mg/mL)",
    apres: "Frasco IV 200 mg/mL", conc: 200,
    frascos: [{ label: "Frasco IV 20% (200 mg/mL)", conc: 200 }],
    compMg: [], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
    resumoBulario: "Diurético osmótico para redução rápida da Pressão Intracraniana (PIC) no Trauma Cranioencefálico (TCE) com estupor/anisocoria e proteção tubular renal na mioglobinúria (choque elétrico).",
    faixasPorGrupo: {
      Padrao: { opcoes: [500, 1000], via: "IV LENTO em 15 a 20 min (500 mg/kg = 0,5 g/kg = 2,5 mL/kg)", badge: "🧠 Redução de Pressão Intracraniana (TCE)", status: "seguro",
        fontes: [["Silverstein 3ª Ed. & Clínica Cirúrgica do Trauma (Raiser)", "TBI: 0.5–1.0 g/kg (2.5–5 mL/kg of 20% solution) IV slowly over 15–20 min.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Vitamina K1", nome: "Vitamina K1 (Fitomenadiona)", comercial: "Kanakion®, Vitamina K1 Vet",
    apres: "Injetável 10 mg/mL", conc: 10,
    frascos: [
      { label: "Ampola 10 mg/mL (Kanakion®)", conc: 10 },
      { label: "Frasco Veterinário 20 mg/mL", conc: 20 }
    ],
    compMg: [10], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [2.5, 2.5, 2.0, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.5, 1.0, 1.0],
    resumoBulario: "Cofator essencial para síntese hepática dos fatores de coagulação II, VII, IX e X. Antídoto específico na intoxicação por Raticidas Cumarínicos/Brodifacoum (manter por 21–28 dias!) e suplementação obrigatória em Tamanduás (Pilosa) e Aves hepatopatas.",
    faixasPorGrupo: {
      Padrao: { opcoes: [1.0, 2.0, 2.5, 5.0], via: "SC ou VO q12–24h (Evitar IV pelo risco de reação anafilactoide!)", badge: "🩸 Antídoto Raticida Cumarínico & Coagulação em Tamanduás", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 995 & Tratado de Animais Selvagens (Cubas)", "Rodenticide anticoagulants: 2.5–5 mg/kg SC/PO initially, then q12h. Xenarthra (Tamanduás): 1–2 mg/kg SC/IM.", "📖 Conferido na Fonte"]]
      }
    }
  }
];
// ============================================================================
// EXPANSÃO DO BANCO DE DADOS: VALORES DE REFERÊNCIA LAB & +16 FÁRMACOS DA ROTINA
// ============================================================================

const LAB_REF_DB = {
  Cao:            { ht:[37,55], ppt:[5.4,7.5], glic:[70,120],  renalNome:"Creatinina (mg/dL)", renal:[0.5,1.5], hepNome:"ALT (U/L)", hep:[10,100], nota:"Ureotélico: avaliar Creatinina + SDMA + Densidade Urinária (>1.030)." },
  Gato:           { ht:[29,45], ppt:[6.0,8.0], glic:[70,150],  renalNome:"Creatinina (mg/dL)", renal:[0.8,1.6], hepNome:"ALT (U/L)", hep:[12,115], nota:"Atenção: hiperglicemia de estresse em gatos pode atingir 250–300 mg/dL. Densidade urinária normal >1.035." },
  Gamba:          { ht:[31,47], ppt:[5.6,7.8], glic:[80,150],  renalNome:"Creatinina (mg/dL)", renal:[0.4,1.2], hepNome:"ALT (U/L)", hep:[20,90],  nota:"Marsupiais (Cubas / Fowler): plaquetas naturalmente elevadas." },
  Columbiformes:  { ht:[42,58], ppt:[2.5,4.5], glic:[220,400], renalNome:"Ác. Úrico (mg/dL)",  renal:[2.5,12.0], hepNome:"AST (U/L)", hep:[70,280], nota:"🚨 Uricotélico: Creatinina não avalia rim em aves! Avaliar Ácido Úrico. Para fígado, avaliar AST em conjunto com CK (se CK normal e AST alta = lesão hepática; Campbell)." },
  Passeriformes:  { ht:[43,58], ppt:[3.0,5.0], glic:[250,450], renalNome:"Ác. Úrico (mg/dL)",  renal:[3.0,12.0], hepNome:"AST (U/L)", hep:[130,380], nota:"🚨 Glicemia < 200 mg/dL em Passeriformes já é HIPOGLICEMIA CRÍTICA!" },
  Psittaciformes: { ht:[40,55], ppt:[3.0,5.0], glic:[210,380], renalNome:"Ác. Úrico (mg/dL)",  renal:[2.0,10.0], hepNome:"AST (U/L)", hep:[130,350], nota:"🚨 Uricotélico (Campbell): Ht < 35% = anemia; Ht > 58% = desidratação. Avaliar Ácido Úrico (rim) e AST + Ácidos Biliares (fígado)." },
  Ramphastidae:   { ht:[40,54], ppt:[3.0,5.0], glic:[200,360], renalNome:"Ác. Úrico (mg/dL)",  renal:[2.5,10.0], hepNome:"AST (U/L)", hep:[120,320], nota:"Tucanos: investigar Hemocromatose (Acúmulo de Ferro) se AST e ácidos biliares elevados." },
  Strigiformes:   { ht:[38,52], ppt:[3.0,4.8], glic:[220,380], renalNome:"Ác. Úrico (mg/dL)",  renal:[3.0,14.0], hepNome:"AST (U/L)", hep:[120,330], nota:"Carnívoros uricotélicos: o Ácido Úrico sobe fisiologicamente nas primeiras 12h pós-prandiais (coletar em jejum curto!)." },
  RapinantesDiurnos:{ ht:[38,52], ppt:[3.0,4.8], glic:[220,380], renalNome:"Ác. Úrico (mg/dL)", renal:[3.0,14.0], hepNome:"AST (U/L)", hep:[120,330], nota:"Ácido Úrico > 15 mg/dL fora do período pós-prandial indica desidratação severa ou gota úrica renal." },
  Cathartiformes: { ht:[38,52], ppt:[3.2,5.0], glic:[200,350], renalNome:"Ác. Úrico (mg/dL)",  renal:[3.0,14.0], hepNome:"AST (U/L)", hep:[110,320], nota:"Urubus: extrema sensibilidade renal a AINEs (exceto Meloxicam) -> elevação fulminante de Ácido Úrico." },
  Pernaltas:      { ht:[38,54], ppt:[3.0,5.0], glic:[200,360], renalNome:"Ác. Úrico (mg/dL)",  renal:[3.0,13.0], hepNome:"AST (U/L)", hep:[120,350], nota:"Em pernaltas recém-capturadas, AST muito alta acompanhada de CK > 2000 U/L confirma Miopatia de Captura!" },
  Coelhos:        { ht:[33,48], ppt:[5.4,7.5], glic:[100,180], renalNome:"Creatinina (mg/dL)", renal:[0.5,2.2], hepNome:"AST (U/L)", hep:[15,70],  nota:"🚨 Em Coelhos (Textbook of Rabbit Medicine): Glicemia > 350 mg/dL na estase GI indica estresse simpático severo ou obstrução intestinal mecânica cirúrgica!" },
  Caviomorfos:    { ht:[35,48], ppt:[4.8,6.8], glic:[80,160],  renalNome:"Creatinina (mg/dL)", renal:[0.4,1.5], hepNome:"ALT (U/L)", hep:[20,80],  nota:"Roedores Caviomorfos têm urina fisiologicamente alcalina e turva (cristais de carbonato de cálcio)." },
  Miomorfos:      { ht:[36,50], ppt:[5.2,7.2], glic:[85,150],  renalNome:"Creatinina (mg/dL)", renal:[0.2,0.8], hepNome:"ALT (U/L)", hep:[20,90],  nota:"Ratos e Camundongos: cromodacriorreia (lágrima vermelha por porfirina da glândula de Harder) indica estresse/dor, não sangue!" },
  Tamandua:       { ht:[30,44], ppt:[5.8,8.0], glic:[60,130],  renalNome:"Creatinina (mg/dL)", renal:[0.5,1.4], hepNome:"ALT (U/L)", hep:[15,80],  nota:"Xenarthra: avaliar coagulograma antes de procedimentos (deficiência de fatores K-dependentes em Tamanduás)." },
  Tatu:           { ht:[32,46], ppt:[5.5,7.8], glic:[70,140],  renalNome:"Creatinina (mg/dL)", renal:[0.5,1.4], hepNome:"ALT (U/L)", hep:[15,85],  nota:"Cingulata (Cubas): coletar da veia coccígea ventral." },
  Primatas:       { ht:[38,52], ppt:[5.5,7.8], glic:[90,180],  renalNome:"Creatinina (mg/dL)", renal:[0.3,1.0], hepNome:"ALT (U/L)", hep:[10,85],  nota:"🚨 Saguis (Callithrix): Glicemia < 70 mg/dL exige suplementação imediata de Glicose!" },
  CarnivorosSilv: { ht:[36,52], ppt:[5.5,7.8], glic:[75,140],  renalNome:"Creatinina (mg/dL)", renal:[0.6,1.6], hepNome:"ALT (U/L)", hep:[15,100], nota:"Canídeos e Felídeos silvestres seguem referências próximas aos domésticos (Fowler)." },
  Testudines:     { ht:[20,35], ppt:[3.0,6.0], glic:[40,120],  renalNome:"Ác. Úrico (mg/dL)",  renal:[1.0,8.0], hepNome:"AST (U/L)", hep:[50,250], nota:"🚨 Quelônios (Artigo Sistema Urinário de Répteis / Campbell): São uricotélicos! Ác. Úrico > 10 mg/dL indica desidratação severa ou gota renal. O EDTA causa hemólise (usar Heparina de Lítio)!" },
  Serpentes:      { ht:[20,38], ppt:[3.5,7.0], glic:[30,100],  renalNome:"Ác. Úrico (mg/dL)",  renal:[2.0,10.0], hepNome:"AST (U/L)", hep:[20,150], nota:"Serpentes e Lagartos: uricotélicos; avaliar Ácido Úrico, AST, CK e relação Cálcio:Fósforo (normal Ca:P > 1,5:1)." }
};

// INJEÇÃO DOS +16 FÁRMACOS DA ROTINA (AINEs, CORTICOIDES, ANESTÉSICOS LOCAIS, GI, ANTIFÚNGICOS E ANTIPARASITÁRIOS)
FARMACOS_DB.push(
  {
    id: "Carprofeno", nome: "Carprofeno (AINE)", comercial: "Rimadyl®, Carproflan®",
    apres: "Injetável 50 mg/mL | Comp. 25, 75 e 100 mg", conc: 50,
    frascos: [{ label: "Injetável 50 mg/mL", conc: 50 }],
    compMg: [25, 75, 100], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [2.2, 0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 0, 2.0, 2.0, 2.0, 4.0, 2.0, 2.0, 2.0, 2.2, 2.0, 2.0],
    resumoBulario: "AINE inibidor preferencial COX-2 excelente para dor ortopédica e pós-operatória em Cães (2,2 mg/kg BID ou 4,4 mg/kg SID), Coelhos, Roedores e Aves (1–4 mg/kg). EVITAR em Gatos repetidamente e PROIBIDO em Urubus!",
    faixasPorGrupo: {
      Gato: { opcoes: [0], via: "⚠️ Evitar uso repetido em Gatos (Preferir Meloxicam ou Robenacoxibe!)", badge: "⚠️ Evitar em Gatos", status: "proibido",
        fontes: [["Plumb's 10ª Ed., p. 201", "Prolonged use in cats is contraindicated due to erratic elimination and GI/renal toxicity.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [2.0, 2.2, 4.4], via: "Cães: 2,2 mg/kg BID ou 4,4 mg/kg SID | Aves/Coelhos/Roed: 2–4 mg/kg q12–24h", badge: "🟢 AINE Ortopédico e Perioperatório", status: "seguro",
        fontes: [["Plumb's 10ª Ed. & Carpenter 6ª Ed., p. 291, 494", "Dogs: 2.2 mg/kg q12h. Birds/Rabbits: 2–4 mg/kg PO, SC, IM q12–24h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Robenacoxibe", nome: "Robenacoxibe (Onsior® — AINE Seguro Gatos/Cães)", comercial: "Onsior® 20 mg/mL | Comp. 6 mg (Gatos), 10, 20, 40 mg",
    apres: "Injetável 20 mg/mL | Comprimidos", conc: 20,
    frascos: [{ label: "Injetável 20 mg/mL (Onsior®)", conc: 20 }],
    compMg: [6, 10, 20, 40], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [2.0, 2.0, 1.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 0, 0],
    resumoBulario: "Coxibe de altíssima seletividade COX-2 com meia-vida plasmática curta e concentração prolongada apenas no tecido inflamado (poupando rins e estômago). Excelente opção para Gatos e Cães!",
    faixasPorGrupo: {
      Padrao: { opcoes: [1.0, 2.0], via: "SC ou VO a cada 24h (SID)", badge: "⭐ AINE Seletivo COX-2 de Alta Segurança em Gatos e Cães", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 1072 & Papich", "Cats & Dogs: 2 mg/kg SC q24h or 1–2.4 mg/kg PO q24h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Prednisolona", nome: "Prednisolona (Corticoide Ativo)", comercial: "Predsim® (3 mg/mL), Prelone®, Meticorten®",
    apres: "Solução Oral 3 mg/mL (Gotas 11 mg/mL)", conc: 3,
    frascos: [
      { label: "Solução Oral 3 mg/mL (Predsim®)", conc: 3 },
      { label: "Gotas Pediátricas 11 mg/mL", conc: 11 }
    ],
    compMg: [5, 20, 40], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [0.5, 1.0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0, 0],
    resumoBulario: "Glicocorticoide de ação intermediária. REGRA CRUCIAL (Plumb's): Em GATOS, usar sempre PREDNISOLONA (gatos absorvem e convertem mal a Prednisona oral!). PROIBIDO em Aves e Coelhos (imunossupressão severa e aspergilose/disbiose fatal) e PROIBIDO no TCE!",
    faixasPorGrupo: {
      Gato: { opcoes: [0.5, 1.0, 2.0], via: "Anti-inflamatória: 0,5–1 mg/kg SID | Imunossupressora: 2–4 mg/kg SID (Desmame gradual obrigatório!)", badge: "⭐ Corticoide de Escolha em Gatos (Preferir à Prednisona!)", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 1004 & Crivellenti", "Cats have poor oral bioavailability/hepatic conversion of prednisone to prednisolone; always prescribe Prednisolone in cats.", "📖 Conferido na Fonte"]]
      },
      Aves: { opcoes: [0], via: "⛔ PROIBIDO CORTICOIDES EM AVES!", badge: "⛔ LETAL (Aspergilose Fulminante / Imunossupressão)", status: "proibido",
        fontes: [["Carpenter 6ª Ed. & Tully — Clínica de Aves", "Corticosteroids cause profound immunosuppression, fatal disseminated aspergillosis, and GI ulceration in birds.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [0.5, 1.0, 2.0], via: "VO a cada 12–24h seguido de desmame escalonado", badge: "🟡 Anti-inflamatório / Alergias / Imunomediadas (Não associar a AINEs!)", status: "alerta",
        fontes: [["Plumb's 10ª Ed., p. 1004", "Anti-inflammatory: 0.5–1 mg/kg/day. Immunosuppressive: 2 mg/kg/day. Never combine with NSAIDs (perforating GI ulcer risk).", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Dexametasona", nome: "Dexametasona", comercial: "Azium® (2 mg/mL), Decadron® (4 mg/mL)",
    apres: "Injetável Veterinário 2 mg/mL", conc: 2,
    frascos: [
      { label: "Frasco Veterinário 2 mg/mL (Azium®)", conc: 2 },
      { label: "Ampola Humana 4 mg/mL (Decadron®)", conc: 4 }
    ],
    compMg: [0.5, 4.0], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [0.15, 0.15, 0.15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.15, 0.1, 0.1, 0.15, 0.15, 0, 0],
    resumoBulario: "Glicocorticoide de longa ação (7x mais potente que a prednisolona). Indicado em anafilaxia, edema de glote/laringe e crises imunomediadas. ESTRITAMENTE PROIBIDO no TCE (aumenta mortalidade), em Aves e simultaneamente com AINEs!",
    faixasPorGrupo: {
      Aves: { opcoes: [0], via: "⛔ CONTRAINDICADO EM AVES!", badge: "⛔ Imunossupressão Letal / Aspergilose", status: "proibido",
        fontes: [["Carpenter 6ª Ed.", "Avoid corticosteroids in avian species.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [0.1, 0.15, 0.25, 0.5], via: "IV, IM ou SC em dose única (Não usar no TCE nem junto com Meloxicam!)", badge: "⚠️ Anafilaxia / Edema de Glote (Proibido no TCE!)", status: "alerta",
        fontes: [["Plumb's 10ª Ed., p. 360 & Silverstein 3ª Ed.", "Anti-inflammatory: 0.07–0.15 mg/kg. Anaphylaxis/airway edema: 0.2–0.5 mg/kg IV. Contraindicated in TBI.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Lidocaina 2%", nome: "Lidocaína 2% Sem Vasoconstritor (Bloqueio Local)", comercial: "Xylestesin® 2% s/ vaso (20 mg/mL)",
    apres: "Injetável 20 mg/mL (Diluir em NaCl p/ pequenos!)", conc: 20,
    frascos: [
      { label: "Frasco Puro 2% (20 mg/mL)", conc: 20 },
      { label: "Diluída 1:4 em NaCl 0,9% (4 mg/mL — Aves/Gatos)", conc: 4 },
      { label: "Diluída 1:10 em NaCl 0,9% (2 mg/mL — Microfauna)", conc: 2 }
    ],
    compMg: [], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [4.0, 2.0, 2.0, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 3.0, 2.0, 2.0],
    resumoBulario: "🚨 CÁLCULO DE DOSE MÁXIMA SEGURA NO BLOQUEIO LOCAL! Em Aves (máx 1,5 a 2 mg/kg) e Gatos (máx 2 a 3 mg/kg), volumes pequenos de Lidocaína 2% pura causam convulsão e parada cardíaca! O volume exibido aqui é o TETO MÁXIMO TOTAL que você pode infiltrar somando todos os pontos do bloqueio!",
    faixasPorGrupo: {
      Aves: { opcoes: [1.0, 1.5, 2.0], via: "Infiltração Local (SEMPRE usar a opção Diluída 1:4 ou 1:10 — NUNCA exceder 2 mg/kg totais!)", badge: "🚨 TETO MÁXIMO DE BLOQUEIO LOCAL (Máx 2 mg/kg!)", status: "alerta",
        fontes: [["Anesthesia of Exotic Pets (Longley) & Carpenter 6ª Ed., p. 283", "Birds are sensitive to local anesthetic toxicity: do not exceed 1.5–2 mg/kg total dose; dilute 1:4 to 1:10 in saline to obtain adequate volume.", "📖 Conferido na Fonte"]]
      },
      Gato: { opcoes: [2.0, 3.0], via: "Bloqueio Local (Teto máximo seguro em Gatos: 2 a 3 mg/kg totais!)", badge: "🚨 TETO MÁXIMO EM GATOS (Evitar toxicidade cardíaca/SNC)", status: "alerta",
        fontes: [["Lumb & Jones & Ibañez (Anestesia Veterinária)", "Gatos: dose máxima segura para infiltração local é de 2 a 4 mg/kg.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [2.0, 4.0], via: "Bloqueio Local / Infiltrativo (Dose máxima segura) ou Bolus IV antiarrítmico Cão (2 mg/kg)", badge: "💉 Teto Seguro para Bloqueio Local", status: "seguro",
        fontes: [["Lumb & Jones & Plumb's 10ª Ed.", "Dogs max local infiltration: 4–6 mg/kg; Small mammals/Reptiles: 2–4 mg/kg.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Bupivacaina 0,5%", nome: "Bupivacaína 0,5% Sem Vaso (Bloqueio Longa Ação)", comercial: "Neocaína® 0,5% (5 mg/mL)",
    apres: "Injetável 5 mg/mL (5 a 8h de analgesia local)", conc: 5,
    frascos: [
      { label: "Frasco Puro 0,5% (5 mg/mL)", conc: 5 },
      { label: "Diluída 1:2 em NaCl (1,66 mg/mL)", conc: 1.66 }
    ],
    compMg: [], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [1.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.5, 1.0, 1.0],
    resumoBulario: "Anestésico local de longa duração (4 a 8 horas). Altamente cardiotóxico se injetado IV acidentalmente (aspirar sempre antes de infiltrar!). Teto máximo absoluto: 1,5 mg/kg em Cães e 1,0 mg/kg em Gatos, Aves e Exóticos.",
    faixasPorGrupo: {
      Padrao: { opcoes: [0.5, 1.0, 1.5], via: "Bloqueio Local/Regional (Aspirar antes! PROIBIDO IV! Teto máx: 1 a 1,5 mg/kg)", badge: "🚨 TETO MÁXIMO DE BLOQUEIO LOCAL (Longa Duração)", status: "alerta",
        fontes: [["Anesthesia of Exotic Pets (Longley) & Plumb's 10ª Ed.", "Max total dose: 1 mg/kg in cats, birds, and exotics; 1.5–2 mg/kg in dogs.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Ondansetrona", nome: "Ondansetrona", comercial: "Vonau Vet® (5 mg/mL), Nausedron® (2 mg/mL)",
    apres: "Injetável 2 mg/mL | Oral 5 mg/mL | Comp. 4 e 8 mg", conc: 2,
    frascos: [
      { label: "Ampola Injetável 2 mg/mL", conc: 2 },
      { label: "Sol. Oral Veterinária 5 mg/mL (Vonau Vet®)", conc: 5 }
    ],
    compMg: [4, 8], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    resumoBulario: "Antagonista seletivo de receptores 5-HT3 de serotonina. Excelente antiemético para náusea severa (uremia, pancreatite, parvovirose, gastroenterites) podendo ser associado ao Maropitant em vômitos refratários.",
    faixasPorGrupo: {
      Padrao: { opcoes: [0.2, 0.5, 1.0], via: "IV lento, SC ou VO a cada 8 a 12h", badge: "🟢 Antiemético 5-HT3 (Pode associar ao Maropitant)", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 924 & Crivellenti", "Dogs & Cats: 0.5–1 mg/kg IV, SC, PO q8–12h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Metoclopramida", nome: "Metoclopramida", comercial: "Plasil® (5 mg/mL), Emeprid®",
    apres: "Injetável 5 mg/mL | Gotas 4 mg/mL", conc: 5,
    frascos: [
      { label: "Ampola Injetável 5 mg/mL", conc: 5 },
      { label: "Gotas Orais 4 mg/mL", conc: 4 }
    ],
    compMg: [10], gotasMl: 21, usoReceita: "uso humano",
    dosesPadrao: [0.4, 0.3, 0.3, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.3, 0.3, 0.3, 0.4, 0.5, 0.5],
    resumoBulario: "Procinético gastrintestinal superior (esvaziamento gástrico/ingluvial). CONTRAINDICADO em suspeita de obstrução mecânica/corpo estranho, perfuração GI ou pacientes epilépticos/convulsivos (efeito extrapiramidal).",
    faixasPorGrupo: {
      Padrao: { opcoes: [0.25, 0.4, 0.5], via: "SC, IM ou VO a cada 8h (Descartar obstrução mecânica antes!)", badge: "🟡 Procinético (Estase de Inglúvio / Gastroparesia)", status: "seguro",
        fontes: [["Carpenter 6ª Ed., p. 299, 493 & Plumb's 10ª Ed.", "Birds (crop stasis without obstruction): 0.5 mg/kg IM, PO q8–12h. Rabbits: 0.5 mg/kg SC, PO q8h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Omeprazol", nome: "Omeprazol", comercial: "Gaviz V®, Losec® (4 mg/mL IV)",
    apres: "Frasco IV 4 mg/mL (40 mg diluído em 10 mL) | Comp. 10 e 20 mg", conc: 4,
    frascos: [{ label: "Injetável Reconstituído 4 mg/mL", conc: 4 }],
    compMg: [10, 20, 40], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    resumoBulario: "Inibidor da bomba de prótons para tratamento de esofagite de refluxo e úlceras gastroduodenais (em sangramento GI ativo ou uso de AINE em marsupiais, usar 1 mg/kg q12h BID conforme Consenso ACVIM!).",
    faixasPorGrupo: {
      Padrao: { opcoes: [1.0], via: "VO ou IV lento a cada 12h (BID para úlcera ativa) ou 24h (SID)", badge: "🟢 Protetor Gástrico (Consenso ACVIM: 1 mg/kg BID na úlcera)", status: "seguro",
        fontes: [["Consenso ACVIM de Gastroprotetores & Plumb's 10ª Ed., p. 918", "1 mg/kg PO or IV q12h is superior to q24h for gastric ulcer healing.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Sucralfato", nome: "Sucralfato (Citoprotetor de Mucosa)", comercial: "Sucrafilm® (200 mg/mL)",
    apres: "Suspensão Oral 200 mg/mL | Comp. 1000 mg", conc: 200,
    frascos: [{ label: "Suspensão Oral 200 mg/mL (2g/10mL)", conc: 200 }],
    compMg: [1000], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
    resumoBulario: "Polissacarídeo sulfatado que forma barreira física aderente sobre úlceras esofágicas, ingluviais e gástricas. Administrar separado (1 a 2h de distância) de outros medicamentos orais (Doxiciclina/Fluoroquinolonas) para não reduzir a absorção deles!",
    faixasPorGrupo: {
      Padrao: { opcoes: [25, 50], via: "VO a cada 8 a 12h (Dar 1–2h longe de outros antibióticos VO!)", badge: "🟢 Esofagite / Úlcera Gástrica ou Ingluvial", status: "seguro",
        fontes: [["Carpenter 6ª Ed., p. 300 & Plumb's 10ª Ed.", "Birds: 25 mg/kg PO q8h. Cats: 250 mg total PO q8–12h. Dogs: 500–1000 mg PO q8h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Itraconazol", nome: "Itraconazol (Esporotricose / Aspergilose)", comercial: "Itraspor®, Sporanox®",
    apres: "Susp. Manipulada 20 mg/mL | Cáps. 25, 50 e 100 mg", conc: 20,
    frascos: [
      { label: "Susp. Manipulada 20 mg/mL", conc: 20 },
      { label: "Susp. Manipulada 10 mg/mL", conc: 10 }
    ],
    compMg: [25, 50, 100], gotasMl: 20, usoReceita: "manipulado",
    dosesPadrao: [5, 10, 5, 10, 10, 10, 10, 10, 10, 10, 10, 5, 5, 5, 5, 5, 5, 10, 5, 5],
    resumoBulario: "Triazol antifúngico de 1ª escolha para Esporotricose Felina (10 mg/kg ou 50–100 mg/gato SID junto com alimento úmido ácido!) e Aspergilose Aviária (5–10 mg/kg). ATENÇÃO: Em Papagaios-cinzentos (Psittacus erithacus), usar dose reduzida (2,5–5 mg/kg) ou Voriconazol pela hepatotoxicidade!",
    faixasPorGrupo: {
      Gato: { opcoes: [5, 10], via: "VO q24h SEMPRE junto com alimento úmido (Esporotricose: 10 mg/kg ou 100 mg/gato > 3 kg SID)", badge: "⭐ 1ª Escolha na Esporotricose e Dermatofitose Felina", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 664 & Crivellenti", "Sporotrichosis in cats: 10 mg/kg PO q24h (or 100 mg/cat for cats >= 3 kg) administered with food.", "📖 Conferido na Fonte"]]
      },
      Aves: { opcoes: [5, 10], via: "VO q12–24h com alimento (Aspergilose)", badge: "🟢 Antifúngico Sistêmico (Aspergilose Aviária)", status: "seguro",
        fontes: [["Carpenter 6ª Ed., p. 258 & Raptor Medicine (Scott)", "Raptors & Most Birds: 5–10 mg/kg PO q12–24h for Aspergillosis.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [5, 10], via: "VO a cada 24h com alimento", badge: "🟢 Micoses Sistêmicas e Cutâneas", status: "seguro",
        fontes: [["Plumb's 10ª Ed., p. 664", "Dogs & Mammals: 5–10 mg/kg PO q24h.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Alopurinol", nome: "Alopurinol (Gota Úrica / Leishmaniose)", comercial: "Zyloric®, Alopurinol Susp. 20 mg/mL",
    apres: "Suspensão 20 mg/mL | Comp. 100 e 300 mg", conc: 20,
    frascos: [{ label: "Suspensão Oral 20 mg/mL", conc: 20 }],
    compMg: [100, 300], gotasMl: 20, usoReceita: "manipulado",
    dosesPadrao: [10, 10, 10, 15, 15, 15, 15, 0, 0, 15, 15, 10, 10, 10, 10, 10, 10, 10, 20, 20],
    resumoBulario: "Inibidor da xantina oxidase que bloqueia a formação de ácido úrico. Essencial no tratamento de Gota Úrica Visceral/Articular em Répteis (20 mg/kg SID) e Psitacídeos (10–15 mg/kg BID, sempre com hidratação intensa!) e na Leishmaniose Canina (10 mg/kg BID). Cuidado em Gaviões/Corujas (doses > 25 mg/kg precipitam cristais de xantina renal!).",
    faixasPorGrupo: {
      Strigiformes: { opcoes: [0], via: "⚠️ Evitar ou usar máx 10 mg/kg c/ hiper-hidratação em Rapinantes (risco de nefropatia por xantina!)", badge: "⚠️ Risco de Xantinúria em Rapinantes", status: "alerta",
        fontes: [["Raptor Medicine (Scott) & Carpenter 6ª Ed., p. 306", "High doses (>25 mg/kg) in red-tailed hawks and owls actually induce visceral gout/xanthine nephropathy.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [10, 15, 20], via: "Cães (Leishmaniose): 10 mg/kg BID | Psitacídeos: 10–15 mg/kg BID | Répteis (Gota): 20 mg/kg SID", badge: "⭐ Redução de Ácido Úrico (Gota em Répteis/Aves) & Leishmaniose", status: "seguro",
        fontes: [["Carpenter 6ª Ed., p. 136, 306 & Artigo Sistema Urinário de Répteis", "Reptiles (hyperuricemia/gout): 20 mg/kg PO q24h with aggressive fluid therapy.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Ivermectina", nome: "Ivermectina 1%", comercial: "Ivomec® 1% (10 mg/mL), Mectimax®",
    apres: "Injetável / Oral 1% (10 mg/mL — Usar Diluição 1:10!)", conc: 10,
    frascos: [
      { label: "Frasco Puro 1% (10 mg/mL)", conc: 10 },
      { label: "Diluída 1:10 em Propilenoglicol (1 mg/mL)", conc: 1 }
    ],
    compMg: [3, 6, 12], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0, 0.2],
    resumoBulario: "Lactona macrocíclica antiparasitária (0,2 a 0,4 mg/kg SC/VO repetindo em 14 dias). ⛔ 100% LETAL EM QUELÔNIOS (Jabutis, Cágados e Tartarugas — atravessa a barreira hematoencefálica causando paralisia flácida respiratória irreversível!) e tóxica em cães com mutação MDR1!",
    faixasPorGrupo: {
      Testudines: { opcoes: [0], via: "⛔ ESTRITAMENTE PROIBIDO EM QUELÔNIOS (JABUTIS / CÁGADOS / TARTARUGAS)!", badge: "⛔ 100% LETAL EM TESTUDINES!", status: "proibido",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 117", "CONTRAINDICATED in all chelonians (tortoises, turtles, terrapins): causes fatal flaccid paralysis and death.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [0.2, 0.4], via: "SC ou VO em dose única, repetindo após 14 dias (Usar Diluição 1:10 ou 1:100 em pequenos!)", badge: "🟡 Ectoparasitas / Sarna / Nematódeos (Proibido em MDR1 e Quelônios!)", status: "alerta",
        fontes: [["Carpenter 6ª Ed., p. 264, 484 & Plumb's 10ª Ed.", "0.2–0.4 mg/kg SC, PO repeat in 14 days.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Fenbendazol", nome: "Fenbendazol", comercial: "Panacur® Susp. 10% (100 mg/mL)",
    apres: "Suspensão Oral 10% (100 mg/mL)", conc: 100,
    frascos: [{ label: "Suspensão Oral 10% (100 mg/mL)", conc: 100 }],
    compMg: [500], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [50, 50, 50, 0, 20, 20, 20, 20, 20, 0, 20, 20, 20, 20, 25, 25, 50, 50, 50, 50],
    resumoBulario: "Benzimidazol anti-helmíntico e antiprotozoário (Giardia em cães/gatos 50 mg/kg SID por 3–5d; E. cuniculi em coelhos 20 mg/kg SID por 28d; Oxiurídeos/Ascarídeos em répteis 50 mg/kg). ⛔ ESTRITAMENTE PROIBIDO em Pombos/Rolinhas (Columbiformes) e Urubus (causa aplasia letal de medula óssea e enterite necrosante!).",
    faixasPorGrupo: {
      Padrao: { opcoes: [20, 50], via: "VO q24h por 3 a 5 dias (Coelhos c/ E. cuniculi: 20 mg/kg SID por 28 dias) — PROIBIDO em Pombos/Rolinhas e Urubus!", badge: "🟡 Anti-helmíntico / Giardia / E. cuniculi (Proibido em Columbiformes!)", status: "alerta",
        fontes: [["Carpenter 6ª Ed., p. 116, 263, 483", "Causes fatal bone marrow suppression and crypt necrosis in Columbiformes (pigeons/doves), vultures, and painted storks.", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Sulfametoxazol+Trim", nome: "Sulfametoxazol + Trimetoprim", comercial: "Bactrim® (40+8 mg/mL), Trissulfin®",
    apres: "Suspensão Oral 48 mg/mL (40 mg SMZ + 8 mg TMP)", conc: 48,
    frascos: [{ label: "Susp. Pediátrica 48 mg/mL (240mg/5mL)", conc: 48 }],
    compMg: [480, 960], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [15, 15, 20, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 20, 20, 25, 15, 25, 25],
    resumoBulario: "Associação bactericida sinérgica e coccidiostática. Seguro por via oral inclusive em Coelhos, Cobaias e Chinchilas (30 mg/kg BID sem causar enterotoxemia!), Aves, Répteis e Mamíferos. Manter paciente bem hidratado.",
    faixasPorGrupo: {
      Padrao: { opcoes: [15, 25, 30], via: "VO q12h (Cães/Gatos: 15–30 mg/kg | Coelhos/Roed/Aves: 30 mg/kg BID | Répteis: 25 mg/kg SID)", badge: "🟢 Seguro por Via Oral em Coelhos/Roedores & Coccidiose", status: "seguro",
        fontes: [["Carpenter 6ª Ed., p. 109, 255, 480", "Safe oral antibiotic in hindgut fermenters (Rabbits/Rodents: 30 mg/kg PO q12h).", "📖 Conferido na Fonte"]]
      }
    }
  },
  {
    id: "Cefalexina", nome: "Cefalexina", comercial: "Rilexine®, Keflex® (50 mg/mL)",
    apres: "Suspensão Oral 50 mg/mL (250mg/5mL)", conc: 50,
    frascos: [{ label: "Suspensão Oral 50 mg/mL", conc: 50 }],
    compMg: [75, 150, 300, 500, 600], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [22, 22, 22, 50, 50, 50, 50, 50, 50, 50, 50, 0, 0, 25, 22, 22, 22, 22, 20, 20],
    resumoBulario: "Cefalosporina de 1ª geração de escolha para Piodermite Superficial e Profunda em Cães e Gatos (22 a 30 mg/kg VO BID — Diretrizes ISCAID). PROIBIDO por via oral em Coelhos, Cobaias e Chinchilas!",
    faixasPorGrupo: {
      ProibidoCeco: { opcoes: [0], via: "⛔ PROIBIDO POR VIA ORAL EM COELHOS E CAVIOMORFOS!", badge: "⛔ Enterotoxemia Fatal", status: "proibido",
        fontes: [["Carpenter 6ª Ed., p. 475", "Oral cephalosporins cause fatal enterotoxemia in rabbits, guinea pigs, and chinchillas.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [22, 30, 50], via: "Cães/Gatos: 22–30 mg/kg VO q12h | Aves: 50–100 mg/kg VO q8–12h", badge: "⭐ 1ª Escolha p/ Piodermites (Cães/Gatos)", status: "seguro",
        fontes: [["Diretrizes ISCAID & Plumb's 10ª Ed., p. 221", "First-line for staphylococcal pyoderma in dogs and cats: 22–30 mg/kg PO q12h.", "📖 Conferido na Fonte"]]
      }
    }
  }
);
// ============================================================================
// EXPANSÃO TAXONÔMICA (PROCIONÍDEOS) & BULÁRIO (ESCOPOLAMINA + PENTABIÓTICO)
// ============================================================================

// 1. Adicionar Grupo Taxonômico Exclusivo: Procionídeos (Procyonidae)
TAXONS_DB.splice(18, 0, {
  id: "Procionideos", grupo: "Carnívoros — Procyonidae", nome: "🦝 Procionídeos (Quati, Mão-pelada e Jupará)",
  tMin: 37.5, tBasalMin: 38.0, tMax: 39.2, fluidoManut: 50, bolusChoque: 12, fatorK: 70, gavMax: 25,
  tuboSangue: "Tubo EDTA + Tampa Vermelha/Amarela (Veia Cefálica, Safena Lateral ou Jugular)",
  vias: "IV (cefálica, safena lateral, jugular), IM (quadríceps/epaxial), SC (interescapular), VO",
  proibido: "⛔ Proibido Corticoides no TCE! Evitar AINEs (Meloxicam/Carprofeno) antes da reidratação completa ou em suspeita de hemorragia GI/insuficiência renal. Cuidado com raiva e Baylisascaris procyonis (zoonose neurológica grave!).",
  regraOuro: "Procionídeos possuem metabolismo rápido de anestésicos dissociativos e pele cervical espessa. Excelentes escaladores com garras afiadas e mordida potente: conter com puçá, cambão ou caixa de contenção para aplicação IM antes do exame físico.",
  subespecies: [
    { nome: "Quati-de-cauda-anelada (Nasua nasua — 3.5 a 6.5kg)", peso: 4.5, unid: "kg", alerta: "Animais sociais; machos adultos solitários frequentemente chegam com feridas profundas por briga intraespecífica (usar Amoxi+Clav ou Clindamicina + analgesia)." },
    { nome: "Mão-pelada / Guaxinim-sul-americano (Procyon cancrivorus — 5 a 9kg)", peso: 6.5, unid: "kg", alerta: "Hábito semiaquático; investigar leptospirose, trauma por atropelamento e parasitoses gastrintestinais." },
    { nome: "Jupará / Macaco-da-noite-verdadeiro (Potos flavus — 2.0 a 3.5kg)", peso: 2.6, unid: "kg", alerta: "Procionídeo estritamente arborícola e noturno de cauda preênsil; sensível a hipotermia durante sedação." }
  ],
  sedacao: [
    { nome: "Contenção Química Padrão (Exame / Curativos / Coleta)", drogas: [["Cetamina", 8.0], ["Midazolam", 0.4], ["Butorfanol", 0.2]], via: "IM (quadríceps ou glúteo)", obs: "West 3ª ed. & Cubas 2ª ed.: associação equilibrada com ótimo relaxamento." },
    { nome: "Sedação Analgésica Moderada (Debilitados / TCE)", drogas: [["Midazolam", 0.4], ["Metadona", 0.2]], via: "IM ou IV", obs: "Segura em traumatismos cranianos." }
  ],
  eutanasia: {
    etapa1: ["Cetamina (12 mg/kg) + Midazolam (0.5 mg/kg) IM", 12, 100, 0.5, 5],
    etapa2: ["Propofol (8 mg/kg IV na cefálica ou safena) até apneia e arreflexia corneal", 8, 10],
    etapa3: ["KCl 19,1% (1 mL/kg IV) EXCLUSIVAMENTE após plano anestésico profundo confirmado!", 1.0]
  }
});

LAB_REF_DB.Procionideos = {
  ht: [35, 48], ppt: [5.5, 7.6], glic: [75, 145],
  renalNome: "Creatinina (mg/dL)", renal: [0.6, 1.5],
  hepNome: "ALT (U/L)", hep: [20, 110],
  nota: "Procyonidae (Fowler / Cubas): referências hematológicas próximas aos canídeos; investigar hemoparasitas e função renal em politraumatizados."
};

// Sincronizar o vetor de doses dos fármacos existentes para incluir o novo índice 18 (Procionideos)
FARMACOS_DB.forEach(f => {
  if (f.dosesPadrao && f.dosesPadrao.length === 20) {
    const doseCarnivoro = f.dosesPadrao[17];
    f.dosesPadrao.splice(18, 0, doseCarnivoro);
  }
});

// 2. Adicionar Escopolamina (Butilbrometo de Escopolamina) e Pentabiótico Veterinário ao Bulário
FARMACOS_DB.push(
  {
    id: "Escopolamina", nome: "Butilbrometo de Escopolamina (Hioscina)", comercial: "Buscopan® Simples (20 mg/mL), Buscofin® (4 mg/mL)",
    apres: "Ampola Humana 20 mg/mL | Vet 4 mg/mL | Gotas 10 mg/mL", conc: 20,
    frascos: [
      { label: "Ampola Humana 20 mg/mL (Buscopan®)", conc: 20 },
      { label: "Injetável Veterinário 4 mg/mL (Buscofin®)", conc: 4 },
      { label: "Gotas Orais 10 mg/mL (20 gts/mL)", conc: 10 }
    ],
    compMg: [10], gotasMl: 20, usoReceita: "uso humano",
    dosesPadrao: [0.5, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0, 0],
    resumoBulario: "Anticolinérgico antiespasmódico de ação seletiva sobre a musculatura lisa gastrintestinal, biliar e geniturinária (reduz cólicas, espasmos uretrais e hipermotilidade dolorosa sem atravessar fortemente a barreira hematoencefálica). QUANDO USAR: Cólicas abdominais agudas, espasmo uretral/vesical (DTUIF pós-desobstrução), gastroenterites espásticas e dor visceral associada à Dipirona. CONTRAINDICAÇÕES: Íleo paralítico / estase gastrintestinal atônica (não usar em coelhos com estase por atonia cecal!), glaucoma, taquiarritmias graves e megacólon.",
    faixasPorGrupo: {
      Aves: { opcoes: [0], via: "⚠️ Evitar uso rotineiro em Aves (risco de estase ingluvial e espessamento de secreções respiratórias)", badge: "⚠️ Evitar em Aves", status: "alerta",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed.", "Anticholinergics cause crop stasis and inspissated airway secretions in avian patients.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [0.3, 0.5, 1.0], via: "IV lento, IM, SC ou VO a cada 8 a 12h (Cães/Gatos/Mamíferos: 0,3 a 0,5 mg/kg; Equinos cólica: 0,3 mg/kg IV)", badge: "🟢 Antiespasmódico Visceral / Cólica / Espasmo Uretral", status: "seguro",
        fontes: [
          ["Plumb's Veterinary Drug Handbook — 10ª Ed. & Spinosa (6ª Ed., p. 118)", "Hyoscine butylbromide: Dogs & Cats 0.3–0.5 mg/kg IV, IM, SC q8–12h for visceral/GI/urinary smooth muscle spasm.", "📖 Conferido na Fonte"],
          ["Equine Medicine Secrets (Savage) & Casos de Rotina (Crivellenti)", "0.3 mg/kg IV for spasmodic colic and visceral analgesia.", "📖 Conferido na Fonte"]
        ]
      }
    }
  },
  {
    id: "Pentabiotico", nome: "Pentabiótico Veterinário® (Associação Penicilinas + Estreptomicina)", comercial: "Pentabiótico Veterinário Pequeno Porte (1.200.000 UI) / Reforçado (6.000.000 UI)",
    apres: "Frasco-ampola Pó + Diluente (Base: Benzilpenicilina Total em UI/kg)", conc: 240000,
    frascos: [
      { label: "Pequeno Porte (1.200.000 UI reconstituído em 5 mL = 240.000 UI/mL)", conc: 240000 },
      { label: "Reforçado (6.000.000 UI reconstituído em 15 mL = 400.000 UI/mL)", conc: 400000 }
    ],
    compMg: [], gotasMl: 20, usoReceita: "uso veterinário",
    dosesPadrao: [30000, 30000, 30000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30000, 30000, 30000, 30000, 30000, 0, 0],
    resumoBulario: "Associação bactericida injetável de Benzilpenicilina Benzatina + Procaína + Potássica + Diidroestreptomicina + Estreptomicina (ação imediata e depósito de 48–72h). QUANDO USAR: Infecções bacterianas sensíveis em Grandes Animais (garrotilho, linfangite ulcerativa, pneumonias, metrites, pododermatites) e, na rotina de campo/resgate de mamíferos adultos hígidos, quando o tutor ou recinto não consegue medicar diariamente (dose única IM profunda a cada 48–72h). 🚨 RESTRIÇÕES CRÍTICAS: 1) NUNCA aplicar por via Intravenosa (a Penicilina Procaína IV causa parada cardiorrespiratória fulminante!); 2) ⛔ 100% LETAL EM COELHOS, COBAIAS, CHINCHILAS, HAMSTERS E AVES PEQUENAS (a Estreptomicina + Procaína causa bloqueio neuromuscular, ototoxicidade/nefrotoxicidade fatal e enterotoxemia!).",
    faixasPorGrupo: {
      Aves: { opcoes: [0], via: "⛔ CONTRAINDICADO EM AVES (Toxicidade aguda da Estreptomicina e Procaína!)", badge: "⛔ PROIBIDO EM AVES", status: "proibido",
        fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 254", "Procaine penicillin + streptomycin combinations cause acute fatal neuromuscular blockade and toxicity in birds.", "📖 Conferido na Fonte"]]
      },
      ProibidoCeco: { opcoes: [0], via: "⛔ 100% LETAL EM COELHOS, COBAIAS E CHINCHILAS!", badge: "⛔ LETAL (Enterotoxemia + Bloqueio Neuromuscular)", status: "proibido",
        fontes: [["Carpenter 6ª Ed., p. 475 & BSAVA Manual of Rodents", "Procaine penicillin and streptomycin are lethal in rabbits, guinea pigs, chinchillas, and hamsters.", "📖 Conferido na Fonte"]]
      },
      Padrao: { opcoes: [20000, 30000, 40000], via: "EXCLUSIVAMENTE IM PROFUNDA (Aspirar antes! PROIBIDO IV!) a cada 48 a 72h (Dose expressa em UI/kg)", badge: "⚠️ IM PROFUNDA APENAS (Proibido IV, Aves e Lagomorfos/Roedores!)", status: "alerta",
        fontes: [
          ["Spinosa — Farmacologia Aplicada à Medicina Veterinária (6ª Ed., p. 466) & Bula Oficial Zoetis", "Dose: 20.000 a 40.000 UI/kg de benzilpenicilinas totais via IM profunda a cada 48–72h. Contraindicado IV e em nefropatas.", "📖 Conferido na Fonte"]
        ]
      }
    }
  }
);
// ============================================================================
// EXPANSÃO TAXONÔMICA COMPLETA v1.6 (BLOCOS A + B + C — 38 GRUPOS TAXONÔMICOS)
// Doses sincronizadas por ID nominal (dosesPorId) + vetor dosesPadrao (38)
// ============================================================================

// 1. Guia Semiológico Dedicado para Anfíbios (Cubas Cap. 12 / Carpenter 6ª ed.)
GUIAS_SEMIOLOGICOS.padraoAnfibios = {
  desid: [
    ["5% (Leve)", "Pele discretamente menos brilhante ou pegajosa; retração discreta dos globos oculares; animal busca insistentemente fonte hídrica."],
    ["8% a 10% (Moderada a Grave)", "Pele seca/opaca ou enrugada na região inguinal e dorso, olhos afundados, muco espesso, perda aguda de peso (> 10%) e letargia — iniciar banho raso imediato com água declorada/Ringer de anfíbio!"]
  ],
  ecc: [
    ["Caquético / Emaciado", "Ossos pélvicos (ílio), urostilo e coluna vertebral muito proeminentes; coxas afiladas sem massa muscular."],
    ["Magro", "Contornos pélvicos facilmente visíveis com reserva celômica reduzida."],
    ["Ideal", "Abdome/celoma levemente arredondado, coxas musculosas e proeminências pélvicas discretas."],
    ["Obeso / Atenção à Hidropsia", "Distensão abdominal acentuada: diferenciar gordura de edema linfático/ascite (Síndrome da Perna Vermelha / insuficiência renal!)."]
  ]
};

// 2. Refinamento dos Grupos Existentes (Bloco B — Subespécies + Separação Canídeos / Serpentes)
(function refinarGruposBase() {
  const byId = id => TAXONS_DB.find(t => t.id === id);

  // 2a. Canídeos Silvestres (mantém id "CarnivorosSilv" no índice 17 p/ compatibilidade total)
  const can = byId("CarnivorosSilv");
  if (can) {
    can.grupo = "Carnívoros — Canidae Silvestre";
    can.nome = "🦊 Canídeos Silvestres (Cachorro-do-mato, Lobo-guará, Raposa)";
    can.proibido = "⛔ Corticoides no TCE! AINEs bloqueados em choque/desidratação/doença renal. Alto risco biológico de Raiva (EPI completo!).";
    can.regraOuro = "Canídeos silvestres seguem farmacologia próxima à canina. No TCE por atropelamento em Cerdocyon thous: cabeceira a 30°, Manitol 20% (500 mg/kg IV lento) ou Salina 7,5% e Metadona + Midazolam. Em Lobo-guará: rastrear cistinúria e Dioctophyma renale!";
    can.subespecies = [
      { nome: "Cachorro-do-mato / Graxaim (Cerdocyon thous — 5 a 8 kg)", peso: 6.0, unid: "kg", alerta: "Canídeo silvestre neotropical: posologia próxima à canina; atenção a TCE por atropelamento e cinomose." },
      { nome: "Lobo-guará (Chrysocyon brachyurus — 20 a 26 kg)", peso: 23.0, unid: "kg", alerta: "🚨 LOBO-GUARÁ (Cubas Cap. 36): Altíssima incidência de cistinúria/urolitíase e parasitismo renal por Dioctophyma renale! Realizar urinálise e US renal; evitar excesso de proteína animal." },
      { nome: "Raposa-do-campo (Lycalopex vetulus — 3 a 4.5 kg)", peso: 3.8, unid: "kg", alerta: "Pequeno canídeo de Cerrado; monitorar termorregulação e risco de cinomose." },
      { nome: "Cachorro-vinagre (Speothos venaticus — 5 a 7 kg)", peso: 6.0, unid: "kg", alerta: "Hábito semiaquático e social; mordida potente." }
    ];
  }

  // 2b. Caviomorfos: adicionar Paca e Cutia (Cubas Cap. 54)
  const cav = byId("Caviomorfos");
  if (cav) {
    cav.nome = "🐹 Caviomorfos (Cobaia, Chinchila, Ouriço, Capivara, Paca, Cutia)";
    cav.subespecies.push(
      { nome: "Paca (Cuniculus paca — 6 a 10 kg)", peso: 8.0, unid: "kg", alerta: "Roedor caviomorfo de pele fina e mordida muito forte: proibido beta-lactâmicos/lincosamidas VO; contenção com puçá/caixa antes de IM." },
      { nome: "Cutia (Dasyprocta azarae — 2.0 a 3.5 kg)", peso: 2.8, unid: "kg", alerta: "Roedor caviomorfo extremamente ágil e suscetível a estresse/miopatia de captura; evitar beta-lactâmicos VO." }
    );
  }

  // 2c. Pernaltas: adicionar Seriema, Tuiuiú e Guará (Cubas Cap. 24)
  const per = byId("Pernaltas");
  if (per) {
    per.nome = "🦩 Pernaltas & Aquáticas (Garça, Socó, Curicaca, Seriema, Tuiuiú, Atobá)";
    per.subespecies.push(
      { nome: "Seriema (Cariama cristata — 1.2 a 1.8 kg)", peso: 1.5, unid: "kg", alerta: "Cariamiformes: ave corredora de membros longos — risco elevado de miopatia de captura e fratura de tibiotarso; bico cortante." },
      { nome: "Tuiuiú / Jaburu (Jabiru mycteria — 6 a 8 kg)", peso: 7.0, unid: "kg", alerta: "🚨 RISCO OCULAR GRAVE: Bico em lança de grande alcance — imobilizar cabeça/bico antes de abrir a caixa e usar EPI ocular." },
      { nome: "Guará / Íbis (Eudocimus ruber — 600 a 900 g)", peso: 750, unid: "g", alerta: "Manter proteção do bico curvo longo; prevenir miopatia de captura." }
    );
  }

  // 2d. Primatas: adicionar Macaco-aranha e Muriqui (Cubas Cap. 34)
  const pri = byId("Primatas");
  if (pri) {
    pri.nome = "🐒 Primatas Neotropicais (Sagui, Macaco-prego, Bugio, Muriqui)";
    pri.subespecies.push(
      { nome: "Macaco-aranha / Muriqui (Ateles / Brachyteles — 7 a 12 kg)", peso: 9.0, unid: "kg", alerta: "Atelidae: grandes primatas arborícolas de cauda preênsil; alto risco de trauma por queda durante dardo/contenção em recinto alto." }
    );
  }

  // 2e. Serpentes: dedicar exclusivamente a Ophidia (Lagartos agora tem grupo próprio!)
  const ser = byId("Serpentes");
  if (ser) {
    ser.grupo = "Répteis — Squamata (Ophidia)";
    ser.nome = "🐍 Serpentes (Jiboia, Arco-íris, Corn Snake, Peçonhentas)";
    ser.subespecies = [
      { nome: "Jiboia / Arco-íris-da-Caatinga (Boa constrictor / Epicrates cenchria)", peso: 1.5, unid: "kg", alerta: "Boidae: aplicar injetáveis na musculatura epaxial da metade cranial; monitorar estomatite e pneumonia." },
      { nome: "Corn Snake / Píton-bola (Pantherophis / Python regius)", peso: 600, unid: "g", alerta: "Colubridae/Pythonidae pet: manter POTZ 27–31 °C e investigar retenção de muda (disecdise) e criptosporidiose." },
      { nome: "Jararaca / Cascavel (Bothrops / Crotalus — Peçonhenta)", peso: 1.0, unid: "kg", alerta: "🚨 SERPENTE PEÇONHENTA: Contenção EXCLUSIVA com gancho herpetológico + tubo acrílico transparente (nunca contenção manual livre!); soro antiofídico mapeado no protocolo de segurança." }
    ];
  }
})();

// 3. Novos 17 Grupos Taxonômicos (Índices 21 a 37 — SEMPRE ao final!)
TAXONS_DB.push(
  // 21: FelideosSilv
  {
    id: "FelideosSilv", grupo: "Carnívoros — Felidae Silvestre", nome: "🐆 Felídeos Silvestres (Onça, Suçuarana, Jaguatirica, Gato-do-mato)",
    tMin: 37.8, tBasalMin: 38.0, tMax: 39.2, fluidoManut: 45, bolusChoque: 8, fatorK: 70, gavMax: 25,
    tuboSangue: "Tubo EDTA + Vermelha/Amarela (Cefálica, Safena Medial ou Jugular sob contenção química)",
    vias: "IV (cefálica, safena medial, jugular), IM (dardo/zarabatana ou manual sob contenção), SC, VO",
    proibido: "⛔ MESMAS RESTRIÇÕES DO GATO DOMÉSTICO (Deficiência de UGT1A6 e ABCG2): PROIBIDO Paracetamol, Carprofeno repetido, Lidocaína IV contínua (FLK) e corticoides no TCE! ⚠️ ENROFLOXACINA: risco de cegueira retiniana irreversível (máx 5 mg/kg SID — preferir Marbofloxacina!).",
    regraOuro: "Contenção química obrigatória (West 3ª ed. / Cubas Cap. 37). Em felinos silvestres debilitados ou em choque, respeitar a tríade do choque felino (aquecer a >= 37 °C antes de expandir volemia rápida) e usar apenas FK/MK na analgesia contínua.",
    subespecies: [
      { nome: "Gato-do-mato / Jaguarundi (Leopardus guttulus / Herpailurus — 2.5 a 5 kg)", peso: 3.5, unid: "kg", alerta: "🚨 FELÍDEO SILVESTRE: Proibido Paracetamol, Carprofeno e Lidocaína IV contínua; preferir Marbofloxacina à Enrofloxacina!" },
      { nome: "Jaguatirica (Leopardus pardalis — 8 a 15 kg)", peso: 11.0, unid: "kg", alerta: "Atenção à sedação balanceada com Midazolam + Opioide + Cetamina/Alfa-2 (West 3ª ed.)." },
      { nome: "Suçuarana / Onça-parda (Puma concolor — 30 a 65 kg)", peso: 45.0, unid: "kg", alerta: "Grande felino: dardo IM na coxa; monitorar oxigenação (SpO2) e hipertermia durante contenção." },
      { nome: "Onça-pintada (Panthera onca — 50 a 110 kg)", peso: 75.0, unid: "kg", alerta: "🚨 ALTO RISCO BIOLÓGICO/FÍSICO: Contenção química estrita (West 3ª ed.); monitorar bradicardia com alfa-2 agonistas e manter antagonista pronto." }
    ],
    sedacao: [
      { nome: "Contenção Química Balanceada (Pequenos/Médios Felídeos)", drogas: [["Cetamina", 5.0], ["Midazolam", 0.3], ["Butorfanol", 0.2]], via: "IM (dardo ou gaiola de contenção)", obs: "Cubas Cap. 37 / West 3ª ed. Pode associar Dexmedetomidina (10–20 µg/kg IM) se hígido." },
      { nome: "Sedação Analgésica Segura (Debilitados / TCE)", drogas: [["Butorfanol", 0.3], ["Midazolam", 0.3]], via: "IM ou IV", obs: "Mínima depressão cardiovascular; segura em trauma craniano." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (8 mg/kg) + Midazolam (0.4 mg/kg) + Metadona/Butorfanol (0.3 mg/kg) IM", 8, 100, 0.4, 5],
      etapa2: ["Propofol (8 mg/kg IV) até apneia e perda total do reflexo corneal", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) EXCLUSIVAMENTE após plano anestésico profundo!", 1.0]
    }
  },
  // 22: Mustelideos
  {
    id: "Mustelideos", grupo: "Carnívoros — Mustelidae", nome: "🦦 Mustelídeos & Ferrets (Furão, Irara, Lontra, Ariranha)",
    tMin: 37.8, tBasalMin: 38.0, tMax: 39.5, fluidoManut: 60, bolusChoque: 10, fatorK: 70, gavMax: 25,
    tuboSangue: "Microtubo EDTA + Heparina (Veia Cava Cranial em Ferrets sob sedação, Jugular ou Safena)",
    vias: "IV (cefálica, safena lateral, jugular), IO (fêmur/tíbia em pequenos), SC (pele dorsal espessa), IM, VO",
    proibido: "⛔ EM FERRETS: PROIBIDO jejum > 3 a 4 horas (risco de crise hipoglicêmica letal por insulinoma!). Alta susceptibilidade a Cinomose Canina (100% fatal!) e Influenza humana (usar máscara se gripado!).",
    regraOuro: "Em Ferrets (BSAVA Rodents & Ferrets / Cubas Cap. 39): aferir sempre a glicemia na chegada (< 70 mg/dL sugere insulinoma) e lembrar que Creatinina > 1,0 mg/dL já indica azotemia! Em Lontras/Ariranhas: risco elevado de hipertermia fora d'água sob sedação.",
    subespecies: [
      { nome: "Furão / Ferret (Mustela putorius furo — 700 g a 1.5 kg)", peso: 1.0, unid: "kg", alerta: "🚨 FERRET: Jejum máximo 3–4h! Aferir glicemia (< 70 mg/dL = insulinoma) e checar alopecia simétrica/aumento vulvar (doença adrenal)." },
      { nome: "Irara / Papa-mel (Eira barbara — 4 a 6.5 kg)", peso: 5.0, unid: "kg", alerta: "Mustelídeo ágil com mordida potente; contenção química IM antes do exame físico." },
      { nome: "Lontra-neotropical (Lontra longicaudis — 6 a 12 kg)", peso: 8.5, unid: "kg", alerta: "Pelagem densa impermeável: monitorar temperatura retal de perto para evitar hipertermia na contenção!" },
      { nome: "Ariranha (Pteronura brasiliensis — 22 a 32 kg)", peso: 26.0, unid: "kg", alerta: "Grande mustelídeo social de mordida extrema; acesso venoso jugular/femoral sob anestesia." }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ Exame, Coleta & RX (Ferrets / Mustelídeos)", drogas: [["Midazolam", 0.5], ["Butorfanol", 0.3]], via: "IM ou SC", obs: "BSAVA Manual of Rodents and Ferrets. Complementar com Isoflurano se necessário." },
      { nome: "Contenção Química (Irara / Lontra / Ariranha)", drogas: [["Cetamina", 8.0], ["Midazolam", 0.4], ["Butorfanol", 0.2]], via: "IM", obs: "Cubas Cap. 38 / West 3ª ed." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (0.5 mg/kg) IM", 15, 100, 0.5, 5],
      etapa2: ["Propofol (8 mg/kg IV) até apneia e arreflexia corneal", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  // 23: Lagartos
  {
    id: "Lagartos", grupo: "Répteis — Squamata (Sauria)", nome: "🦎 Lagartos (Iguana-verde, Teiú, Pogona, Gecko-leopardo)",
    tMin: 27.0, tBasalMin: 28.0, tMax: 34.0, fluidoManut: 20, bolusChoque: 5, fatorK: 10, gavMax: 15,
    tuboSangue: "Microtubo com Heparina de Lítio (Veia Coccígea Ventral — abordagem ventral ou lateral)",
    vias: "IM e SC EXCLUSIVAMENTE nos MEMBROS ANTERIORES (evitar sistema porta-renal caudal), IV (coccígea ventral, cefálica), IO (úmero/tíbia), VO",
    proibido: "⛔ NUNCA segurar pela cauda (autotomia caudal!). Proibido corticoides sistêmicos de rotina e Pentabiótico. Evitar Ivermectina em camaleões e filhotes (preferir Fenbendazol).",
    regraOuro: "Manter estritamente na POTZ (28–34 °C) durante qualquer tratamento! Em Iguanas e Pogonas: investigar sempre Doença Osteometabólica (DOM / deficiência de UVB e Ca:P) e retenção folicular/estase pré-ovulatória. Em Teiús: atenção à mordida e chicoteada caudal.",
    subespecies: [
      { nome: "Iguana-verde (Iguana iguana — 1.0 a 4.0 kg)", peso: 2.0, unid: "kg", alerta: "Herbívoro estrito (excesso de proteína animal causa doença renal e gota úrica!). Avaliar UVB e cálcio na DOM." },
      { nome: "Teiú (Salvator merianae — 1.5 a 4.5 kg)", peso: 2.5, unid: "kg", alerta: "Onívoro de mordida e cauda potentes; brumação fisiológica no inverno reduz metabolismo." },
      { nome: "Dragão-barbudo / Pogona (Pogona vitticeps — 300 a 550 g)", peso: 420, unid: "g", alerta: "Investigar impacção GI por areia, lipidose hepática e adenovírus." },
      { nome: "Gecko-leopardo (Eublepharis macularius — 50 a 90 g)", peso: 65, unid: "g", alerta: "Microfauna: usar Diluição 1:10/1:100; atenção à cauda gorda (autotomia!) e criptosporidiose." }
    ],
    sedacao: [
      { nome: "Contenção / Procedimentos Clínicos & Radiografia", drogas: [["Cetamina", 15.0], ["Midazolam", 1.5]], via: "IM nos membros anteriores", obs: "Associar Tramadol (5–10 mg/kg) em fraturas ou procedimentos dolorosos (Carpenter 6ª ed.)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (30 mg/kg) + Midazolam (2 mg/kg) IM nos membros anteriores", 30, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV na veia coccígea ventral ou IO) até perda de reflexos", 10, 10],
      etapa3: ["KCl 19,1% (1.5 mL/kg IV/IC) após anestesia profunda.", 1.5]
    }
  },
  // 24: Crocodilianos
  {
    id: "Crocodilianos", grupo: "Répteis — Crocodylia", nome: "🐊 Crocodilianos (Jacaré-de-papo-amarelo, Tinga, Pantanal)",
    tMin: 28.0, tBasalMin: 28.0, tMax: 32.0, fluidoManut: 15, bolusChoque: 5, fatorK: 10, gavMax: 15,
    tuboSangue: "⚠️ OBRIGATÓRIO HEPARINA DE LÍTIO (EDTA lisa hemácias!). Coleta: Seio Venoso Occipital (Supravertebral) ou Coccígea Ventral.",
    vias: "IM (membros anteriores entre escamas laterais ou base lateral cranial da cauda — evitar osteodermos dorsais!), IV (seio occipital / coccígea ventral), SC, VO",
    proibido: "⛔ PROIBIDO IVERMECTINA EM CROCODILIANOS (neurotoxicidade e paresia relatadas — Carpenter 6ª ed., p. 117!). Proibido corticoides, Pentabiótico e contenção sem imobilização prévia da mandíbula e proteção da cauda!",
    regraOuro: "Contenção física: imobilizar a mandíbula com fita resistente (deixando narinas livres!), vendar os olhos (reflexo vasovagal reduz estresse) e conter a cauda. Manter na POTZ (28–32 °C). Antibiótico injetável de 1ª linha: Ceftazidima (20 mg/kg IM q72h).",
    subespecies: [
      { nome: "Jacaré-de-papo-amarelo (Caiman latirostris — 8 a 40 kg)", peso: 18.0, unid: "kg", alerta: "Espécie frequente em resgates no Sudeste/Sul; atenção à hipotermia no inverno e lesões por arpão/anzol." },
      { nome: "Jacaré-tinga (Caiman crocodilus — 6 a 30 kg)", peso: 15.0, unid: "kg", alerta: "" },
      { nome: "Jacaré-do-pantanal (Caiman yacare — 10 a 45 kg)", peso: 20.0, unid: "kg", alerta: "" },
      { nome: "Filhote / Juvenil de Jacaré (< 2 kg)", peso: 800, unid: "g", alerta: "Atenção à hipoglicemia por estresse e doença osteometabólica (DOM) em recintos sem UVB." }
    ],
    sedacao: [
      { nome: "Contenção Química Segura (Exame Oral / Retirada de Anzol / RX)", drogas: [["Cetamina", 15.0], ["Midazolam", 1.0]], via: "IM nos membros anteriores", obs: "West 3ª ed. / Cubas Cap. 13. Manter aquecido (28–30 °C) e fora da água até recuperação total!" }
    ],
    eutanasia: {
      etapa1: ["Cetamina (30 mg/kg) + Midazolam (2 mg/kg) IM nos membros anteriores", 30, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV no seio venoso occipital) até arreflexia profunda", 10, 10],
      etapa3: ["KCl 19,1% (1.5 mL/kg IV no seio occipital) após plano profundo.", 1.5]
    }
  },
  // 25: Cervideos
  {
    id: "Cervideos", grupo: "Artiodactyla — Cervidae (Ruminantes)", nome: "🦌 Cervídeos (Veado-catingueiro, Mateiro, Cervo-do-pantanal, Gamo)",
    tMin: 38.0, tBasalMin: 38.2, tMax: 39.5, fluidoManut: 45, bolusChoque: 15, fatorK: 70, gavMax: 20,
    tuboSangue: "Tubo EDTA + Vermelha/Amarela (Veia Jugular Externa)",
    vias: "IV (jugular, cefálica, safena), IM (glúteo/semimembranoso/pescoço — dardo ou manual), SC, VO (somente fármacos que preservem o rúmen!)",
    proibido: "⛔ PROIBIDO antimicrobianos orais beta-lactâmicos/lincosamidas em adultos (Amoxi+Clav VO, Clindamicina, Cefalexina VO destroem microbiota ruminal!). ⛔ PROIBIDO decúbito lateral prolongado sem suporte (timpanismo ruminal + broncoaspiração letal!).",
    regraOuro: "🚨 EMERGÊNCIA EM CERVÍDEOS (Cubas Cap. 51 / West 3ª ed.): 1) MIOPATIA DE CAPTURA (T > 40,5 °C = resfriamento imediato com água/álcool nas virilhas + O2 + fluido + Vitamina E/Selênio!); 2) Manter SEMPRE em DECÚBITO ESTERNAL com cabeça erguida e focinho inclinado para baixo; 3) Vendar os olhos e reduzir ruído ao mínimo.",
    subespecies: [
      { nome: "Veado-catingueiro (Subulo gouazoubira — 15 a 25 kg)", peso: 18.0, unid: "kg", alerta: "Extremamente suscetível à miopatia de captura e trauma cervical em cercas; manter venda ocular e silêncio absoluto!" },
      { nome: "Veado-mateiro (Mazama americana — 25 a 45 kg)", peso: 32.0, unid: "kg", alerta: "Risco elevado de hipertermia e timpanismo ruminal durante contenção." },
      { nome: "Cervo-do-pantanal (Blastocerus dichotomus — 80 a 130 kg)", peso: 100.0, unid: "kg", alerta: "Grande ruminante silvestre; monitorar SpO2, temperatura retal e decúbito esternal." },
      { nome: "Gamo / Cervo-nobre (Dama dama / Cervus elaphus — 50 a 120 kg)", peso: 65.0, unid: "kg", alerta: "Cuidado com galhadas em machos no período reprodutivo (rut)." }
    ],
    sedacao: [
      { nome: "Contenção Química Balanceada (Exame / Curativos / Transporte)", drogas: [["Cetamina", 5.0], ["Midazolam", 0.3], ["Butorfanol", 0.2]], via: "IM (dardo ou contenção)", obs: "Cubas Cap. 51 / West 3ª ed. Pode associar Xilazina/Dexmedetomidina se hígido (sempre ter Ioimbina/Atipamezol pronto!)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (8 mg/kg) + Midazolam (0.4 mg/kg) IM", 8, 100, 0.4, 5],
      etapa2: ["Propofol (6 mg/kg IV na jugular) até apneia e perda do reflexo corneal", 6, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV na jugular) EXCLUSIVAMENTE após inconsciência profunda!", 1.0]
    }
  },
  // 26: Tapiridae
  {
    id: "Tapiridae", grupo: "Perissodactyla — Tapiridae", nome: "🦛 Antas (Tapirus terrestris)",
    tMin: 36.2, tBasalMin: 36.5, tMax: 37.8, fluidoManut: 45, bolusChoque: 15, fatorK: 70, gavMax: 20,
    tuboSangue: "Tubo EDTA + Vermelha/Amarela (Veia Cefálica, Safena Medial ou Marginal Auricular)",
    vias: "IV (cefálica, safena medial, auricular — jugular muito profunda!), IM (agulha longa 40×12 no pescoço/glúteo — pele extremamente espessa!), SC, VO",
    proibido: "⛔ PROIBIDO Clindamicina, Lincomicina e beta-lactâmicos orais (fermentador pós-gástrico semelhante a equinos — risco de colite clostridial letal!). Evitar superaquecimento (> 38,5 °C já é hipertermia em antas!).",
    regraOuro: "Temperatura normal de Antas é mais baixa que outros ungulados (36,5–37,8 °C — Cubas Cap. 47). Fermentação cecocólica (extrapolar farmacologia segura de Equídeos: Meloxicam 0,6 mg/kg, SMZ+TMP VO, Pentabiótico IM profunda). Acalmam-se muito com coçagem dorsal/flanco!",
    subespecies: [
      { nome: "Anta-brasileira Adulta (Tapirus terrestris — 150 a 250 kg)", peso: 190.0, unid: "kg", alerta: "Pele dorsal/cervical espessa (agulha 40×12 p/ IM); atenção a prolapso retal e lesões podais." },
      { nome: "Filhote / Juvenil de Anta (15 a 60 kg)", peso: 35.0, unid: "kg", alerta: "Atenção à hipoglicemia, diarreias neonatais e termorregulação." }
    ],
    sedacao: [
      { nome: "Contenção Química / Sedação em Pé ou Decúbito", drogas: [["Butorfanol", 0.15], ["Midazolam", 0.2], ["Cetamina", 3.0]], via: "IM profunda (agulha longa)", obs: "West 3ª ed. / Cubas Cap. 47. Frequentemente combinada com Alfa-2 (Detomidina/Medetomidina) com reversão." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (5 mg/kg) + Midazolam (0.3 mg/kg) + Butorfanol (0.15 mg/kg) IM profunda", 5, 100, 0.3, 5],
      etapa2: ["Propofol (5 mg/kg IV na cefálica/safena) até apneia e arreflexia", 5, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  // 27: Ratitas
  {
    id: "Ratitas", grupo: "Aves — Rheiformes & Struthioniformes", nome: "🦤 Ratitas (Ema, Avestruz, Emu e Casuar)",
    tMin: 38.5, tBasalMin: 39.0, tMax: 40.5, fluidoManut: 45, bolusChoque: 10, fatorK: 78, gavMax: 15,
    tuboSangue: "Tubo Heparina de Lítio (Veia Jugular Direita, Basílica/Ulnar ou Metatarsal Medial)",
    vias: "IM EXCLUSIVAMENTE na musculatura pélvica/coxa (ílio-tibial) — ⛔ NÃO POSSUEM QUILHA NEM MÚSCULO PEITORAL! IV (jugular direita, basílica, metatarsal), SC, VO",
    proibido: "⛔ PROIBIDO tentar injeção IM peitoral (esterno plano sem músculo!). ⛔ PROIBIDO Corticoides (aspergilose!) e Pentabiótico. ⛔ NUNCA se posicionar à frente de Avestruz/Casuar (chute frontal letal!).",
    regraOuro: "Cubas Cap. 18 / Carpenter 6ª ed.: Colocar capuz escuro na cabeça reduz drasticamente o estresse. Altíssimo risco de MIOPATIA DE CAPTURA (monitorar CK e temperatura) e impacção gástrica por corpos estranhos. Na anestesia, apoiar o pescoço longo para não obstruir traqueia.",
    subespecies: [
      { nome: "Ema (Rhea americana — 20 a 30 kg)", peso: 24.0, unid: "kg", alerta: "Risco elevado de miopatia de captura e fratura de tibiotarso; aplicar IM apenas na coxa." },
      { nome: "Avestruz (Struthio camelus — 90 a 140 kg)", peso: 110.0, unid: "kg", alerta: "🚨 SEGURANÇA: Chute frontal potencialmente letal! Conter sempre lateralmente/por trás e encapuzar imediatamente." },
      { nome: "Emu (Dromaius novaehollandiae — 30 a 45 kg)", peso: 36.0, unid: "kg", alerta: "Forte tendência a chutar para frente e para os lados; alto risco de hipertermia na contenção." },
      { nome: "Casuar (Casuarius casuarius — 35 a 55 kg)", peso: 45.0, unid: "kg", alerta: "🚨 RISCO EXTREMO DE EQUIPE: Garra medial em adaga — manejo físico apenas com escudos rígidos ou dardo IM na coxa!" }
    ],
    sedacao: [
      { nome: "Sedação / Contenção Química (IM na Coxa!)", drogas: [["Cetamina", 10.0], ["Midazolam", 0.5], ["Butorfanol", 0.5]], via: "IM (músculo ílio-tibial / coxa — NUNCA no peito!)", obs: "West 3ª ed. / Cubas Cap. 18. Encapuzar durante indução e recuperação para evitar traumas." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1 mg/kg) IM na musculatura da coxa", 15, 100, 1.0, 5],
      etapa2: ["Propofol (8 mg/kg IV na jugular direita) até apneia e arreflexia", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  // 28: Anseriformes
  {
    id: "Anseriformes", grupo: "Aves — Anseriformes", nome: "🦆 Anseriformes (Pato, Marreco, Ganso e Cisne)",
    tMin: 40.0, tBasalMin: 40.5, tMax: 42.0, fluidoManut: 55, bolusChoque: 10, fatorK: 78, gavMax: 20,
    tuboSangue: "⚠️ Usar HEPARINA DE LÍTIO (EDTA causa hemólise em vários patos, gansos e cisnes! Coleta: Metatarsal Medial ou Jugular Direita).",
    vias: "IV (metatarsal medial, basílica, jugular direita), IO (ulna distal/tibiotarso), IM (peitoral), SC, VO",
    proibido: "⛔ Corticoides (Aspergilose!), Pentabiótico, tubo traqueal com cuff inflado e acesso IO em úmero/fêmur.",
    regraOuro: "Cubas Cap. 20 / Carpenter 6ª ed.: Em paralisia flácida ascendente ('pescoço mole' / limberneck), suspeitar imediatamente de BOTULISMO (suporte com fluidoterapia, gavagem, proteção ocular e retirada do lago contaminado) ou intoxicação por CHUMBO/ZINCO (RX de moela!). Atenção a Pododermatite e prolapso de falo em machos.",
    subespecies: [
      { nome: "Marreco / Irerê (Dendrocygna / Anas — 600 g a 1.1 kg)", peso: 850, unid: "g", alerta: "" },
      { nome: "Pato-do-mato / Doméstico (Cairina moschata — 2.0 a 4.0 kg)", peso: 2.8, unid: "kg", alerta: "Alta incidência de bumblefoot, botulismo e prolapso fálico em machos." },
      { nome: "Ganso / Cisne (Anser / Cygnus — 4.0 a 10.0 kg)", peso: 5.5, unid: "kg", alerta: "Cuidado com golpe das asas; atenção especial à intoxicação por chumbo e aspergilose." }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ RX, Curativo de Bumblefoot e Manejo", drogas: [["Midazolam", 1.5], ["Butorfanol", 1.5]], via: "IM ou IV (metatarsal)", obs: "Carpenter 6ª ed. Associar Cetamina (10 mg/kg IM) se precisar de imobilização maior." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1.5 mg/kg) IM peitoral", 15, 100, 1.5, 5],
      etapa2: ["Propofol (10 mg/kg IV na metatarsal medial) até arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  // 29: Galliformes
  {
    id: "Galliformes", grupo: "Aves — Galliformes & Tinamiformes", nome: "🦚 Galliformes & Tinamiformes (Jacu, Mutum, Pavão, Galinha, Inhambu)",
    tMin: 40.5, tBasalMin: 40.5, tMax: 42.5, fluidoManut: 55, bolusChoque: 10, fatorK: 78, gavMax: 25,
    tuboSangue: "Microtubo com Heparina de Lítio (Veia Basílica/Ulnar ou Jugular Direita)",
    vias: "VO (inglúvio verdadeiro), IM (peitoral), SC (inguinal/cervical), IV (basílica, metatarsal, jugular), IO (ulna/tibiotarso)",
    proibido: "⛔ Corticoides, Pentabiótico, tubo traqueal com cuff. ⚠️ EM AVES DE PRODUÇÃO/OVOS: Metronidazol e diversos fármacos são PROIBIDOS por lei (resíduos na cadeia alimentar)!",
    regraOuro: "Cubas Cap. 19 & 21 / Diseases of Poultry: Investigar Micoplasmose (sinusite infraorbitária → Doxiciclina/Tilosina), Bouba Aviária, Histomoníase (em pavões/mutuns), Marek e pododermatite. Em Tinamiformes (Inhambu/Codorna), cuidado extremo com estresse de contenção (autotomia de penas e miopatia!).",
    subespecies: [
      { nome: "Jacu / Aracuã / Jacutinga (Penelope / Ortalis / Aburria — 0.7 a 1.5 kg)", peso: 1.1, unid: "kg", alerta: "Cracidae neotropical: sensíveis a micoplasmose e aspergilose." },
      { nome: "Mutum / Pavão (Crax / Pavo cristatus — 2.5 a 5.0 kg)", peso: 3.5, unid: "kg", alerta: "Alta sensibilidade à Histomoníase ('cabeça negra') e pododermatite." },
      { nome: "Galinha-doméstica / Pet (Gallus gallus — 1.2 a 2.8 kg)", peso: 1.8, unid: "kg", alerta: "Se os ovos/carne forem consumidos, respeitar legislação de carência e proibições (ex.: Metronidazol proibido em produção!)." },
      { nome: "Inhambu / Codorna / Perdiz (Tinamiformes — 150 a 500 g)", peso: 280, unid: "g", alerta: "Risco extremo de trauma craniano por voo explosivo vertical em gaiolas rígidas (forrar teto com espuma/tecido!)." }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ Procedimentos e Radiografia", drogas: [["Midazolam", 1.5], ["Butorfanol", 1.5]], via: "IM (peitoral)", obs: "Associar Cetamina (10–15 mg/kg IM) ou Isoflurano para cirurgias." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (20 mg/kg) + Midazolam (2 mg/kg) IM", 20, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV na basílica) até apneia e arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  // 30: Tayassuidae
  {
    id: "Tayassuidae", grupo: "Artiodactyla — Tayassuidae & Suidae", nome: "🐗 Cateto, Queixada, Javali & Mini-pig",
    tMin: 38.0, tBasalMin: 38.2, tMax: 39.5, fluidoManut: 50, bolusChoque: 15, fatorK: 70, gavMax: 25,
    tuboSangue: "Tubo EDTA + Vermelha/Amarela (Veia Cava Cranial, Jugular Externa ou Auricular Marginal)",
    vias: "IV (veia marginal da orelha, cefálica), IM (pescoço atrás da orelha — evitar tecido adiposo espesso!), SC, VO",
    proibido: "⛔ Corticoides no TCE! Risco elevado de HIPERTERMIA MALIGNA / estresse térmico (suínos e taiassuídeos não suam de forma eficaz — resfriar imediatamente se T > 40 °C!).",
    regraOuro: "Cubas Cap. 48 / West 3ª ed.: Contenção segura contra os caninos afiados de catetos e queixadas. Intubação endotraqueal difícil (laringe angulada + divertículo faríngeo — usar guia/estilete!). Em Mini-pigs pet, investigar obesidade, artrite e erisipela.",
    subespecies: [
      { nome: "Cateto / Caititu (Dicotyles tajacu — 15 a 25 kg)", peso: 20.0, unid: "kg", alerta: "Glândula odorífera dorsal lombar (não confundir com ferida/abscesso!); caninos cortantes." },
      { nome: "Queixada (Tayassu pecari — 25 a 40 kg)", peso: 32.0, unid: "kg", alerta: "Animais de bando altamente defensivos; contenção química IM recomendada." },
      { nome: "Mini-pig / Suíno Pet (Sus scrofa domesticus — 15 a 60 kg)", peso: 30.0, unid: "kg", alerta: "Acesso venoso na veia marginal da orelha; risco de hipertermia sob estresse." },
      { nome: "Javali / Porco-monteiro (Sus scrofa — 50 a 110 kg)", peso: 70.0, unid: "kg", alerta: "Espécie exótica invasora com alto risco sanitário (Peste Suína / Aujeszky / Brucelose)." }
    ],
    sedacao: [
      { nome: "Contenção Química Balanceada (Exame / Curativo / Transporte)", drogas: [["Cetamina", 10.0], ["Midazolam", 0.4], ["Butorfanol", 0.2]], via: "IM (pescoço atrás da orelha)", obs: "Cubas Cap. 48 / West 3ª ed. Monitorar temperatura retal continuamente." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (0.5 mg/kg) IM", 15, 100, 0.5, 5],
      etapa2: ["Propofol (6 mg/kg IV na veia auricular) até arreflexia", 6, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  // 31: Apodiformes
  {
    id: "Apodiformes", grupo: "Aves — Apodiformes (Microfauna Extrema)", nome: "✨ Beija-flores e Andorinhões (Apodiformes)",
    tMin: 18.0, tBasalMin: 39.5, tMax: 42.5, fluidoManut: 100, bolusChoque: 10, fatorK: 150, gavMax: 15,
    tuboSangue: "⚠️ Coleta de sangue raramente indicada em Beija-flores < 10 g (volume seguro < 0,04 mL!). Em Andorinhões: capilar heparinizado.",
    vias: "VO (gota na ponta do bico com seringa de insulina — 1ª escolha!), Intranasal, SC/IM apenas em Diluição 1:100 (extrema cautela!)",
    proibido: "⛔ NUNCA OFERECER MEL (risco letal de candidíase/aspergilose de língua e inglúvio!). ⛔ PROIBIDO jejum > 20–30 minutos em beija-flores! ⛔ PROIBIDO fármacos injetáveis puros (superdosagem volumétrica fatal!), Corticoides e Pentabiótico.",
    regraOuro: "Cubas Cap. 29: 1) EMERGÊNCIA ENERGÉTICA IMEDIATA: oferecer gotas de néctar (1 parte de açúcar branco refinado para 4 partes de água filtrada = 20%) a cada 15–20 minutos; 2) TORPOR NOTURNO FISIOLÓGICO: à noite, a temperatura cai para 18–25 °C — não confundir com óbito nem superaquecer bruscamente!",
    subespecies: [
      { nome: "Beija-flor-tesoura / Médio (Eupetomena / Amazilia — 4 a 9 g)", peso: 6, unid: "g", alerta: "🚨 PESO 4–9 g: Oferecer néctar 20% IMEDIATAMENTE! Toda medicação exige Diluição 1:100 ou via oral." },
      { nome: "Beija-flor-pequeno (Chlorostilbon / Phaethornis — 2.5 a 5 g)", peso: 4, unid: "g", alerta: "🚨 MICROFAUNA EXTREMA (2,5–5 g): Risco de morte por hipoglicemia em 20 minutos; manipular o mínimo possível." },
      { nome: "Andorinhão (Streptoprocne / Chaetura — 20 a 100 g)", peso: 35, unid: "g", alerta: "Insetívoro aéreo: não consegue decolar do chão plano (testar voo apenas a partir de superfície elevada segura!); usar Diluição 1:10/1:100." }
    ],
    sedacao: [
      { nome: "Sedação Intranasal Antiestresse (Diluição 1:100 em Beija-flores!)", drogas: [["Midazolam", 2.0], ["Butorfanol", 2.0]], via: "Intranasal (preferir Isoflurano em máscara p/ procedimentos!)", obs: "Cubas Cap. 29 / Carpenter 6ª ed." }
    ],
    eutanasia: {
      etapa1: ["Midazolam (2 mg/kg) intranasal ou indução direta suave em câmara de Isoflurano", 15, 100, 2.0, 5],
      etapa2: ["Isoflurano em alta concentração até apneia e arreflexia profunda", 10, 10],
      etapa3: ["KCl 19,1% (apenas após confirmação absoluta de plano profundo).", 1.0]
    }
  },
  // 32: Anfibios
  {
    id: "Anfibios", grupo: "Anfíbios — Anura & Caudata", nome: "🐸 Anfíbios (Sapo-cururu, Rã, Perereca, Axolote)",
    tMin: 18.0, tBasalMin: 20.0, tMax: 26.0, fluidoManut: 25, bolusChoque: 5, fatorK: 5, gavMax: 10,
    tuboSangue: "Microtubo com Heparina de Lítio (Veia Abdominal Ventral ou Femoral — hemácias nucleadas grandes)",
    vias: "Banho terapêutico transdérmico (1ª escolha em água declorada!), Intracelômica (ICe — quadrante caudal), Saco linfático dorsal (SC), IM (membro anterior), VO",
    proibido: "⛔ PROIBIDO MANUSEAR SEM LUVAS SEM TALCO UMEDECIDAS! ⛔ PROIBIDO ÁLCOOL, PVPI/IODO, CLOREXIDINA ALCOÓLICA E ÁGUA CLORADA DA TORNEIRA (absorção cutânea letal!). ⛔ Proibido Pentabiótico, Lidocaína/Bupivacaína tópica sem controle (usar MS-222!), Corticoides e AINEs em hidropsia/falência renal.",
    regraOuro: "Cubas Cap. 12 / Carpenter 6ª ed. (Cap. 2): Pele semipermeável respira e absorve fármacos — toda água deve ser DECLORADA! Reidratação por banho raso (Ringer de Anfíbio ou NaCl 0,9% diluído 2:1 em água destilada). Em letargia/eritema ventral ('Perna Vermelha') ou descamação: pesquisar Quitridiomicose (Bd → banho de Itraconazol 0,01% por 5 min/dia × 10 dias!).",
    subespecies: [
      { nome: "Sapo-cururu (Rhinella diptycha / R. icterica — 150 a 600 g)", peso: 300, unid: "g", alerta: "Glândulas parotoides secretam bufotoxinas cardiotóxicas sob pressão — usar luvas umedecidas e proteger olhos." },
      { nome: "Rã-touro / Rã-pimenta (Aquarana / Leptodactylus — 150 a 500 g)", peso: 250, unid: "g", alerta: "Investigar Síndrome da Perna Vermelha (Aeromonas/Ranavírus) e manter umidade controlada." },
      { nome: "Perereca / Rã-arborícola (Boana / Phyllomedusa — 15 a 80 g)", peso: 35, unid: "g", alerta: "Pele muito delicada; usar Diluição 1:10/1:100 ou banhos terapêuticos em água declorada." },
      { nome: "Axolote / Salamandra (Ambystoma mexicanum — 60 a 150 g)", peso: 90, unid: "g", alerta: "🚨 ESTRITAMENTE AQUÁTICO DE ÁGUA FRIA (16–20 °C): Água > 24 °C causa estresse severo e infecções branquiais!" }
    ],
    sedacao: [
      { nome: "Anestesia / Contenção Química (Preferir Banho de MS-222 0,5–1 g/L tamponado!)", drogas: [["Cetamina", 30.0], ["Midazolam", 1.0]], via: "IM/SC (saco linfático dorsal) ou Banho de MS-222 tamponado com NaHCO3", obs: "Carpenter 6ª ed. Na recuperação, enxaguar com água declorada limpa mantendo narinas fora da água!" }
    ],
    eutanasia: {
      etapa1: ["Banho de MS-222 (Tricaína 5–10 g/L tamponado) ou Cetamina (50 mg/kg) + Midazolam (2 mg/kg) ICe", 50, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg ICe/IV) ou imersão prolongada em MS-222 até ausência total de batimentos cardíacos (confirmar por Doppler!)", 10, 10],
      etapa3: ["KCl 19,1% (1.5 mL/kg ICe/IC) somente após confirmação absoluta de inconsciência profunda.", 1.5]
    }
  },
  // 33: Equideos
  {
    id: "Equideos", grupo: "Grandes Animais — Perissodactyla (Equidae)", nome: "🐴 Equídeos (Cavalo, Pônei, Zebra, Asinino)",
    tMin: 37.2, tBasalMin: 37.5, tMax: 38.5, fluidoManut: 50, bolusChoque: 20, fatorK: 70, gavMax: 15,
    tuboSangue: "Tubo EDTA + Vermelha/Amarela + Fluoreto/Heparina (Lactato na Cólica! Coleta: Jugular Externa)",
    vias: "IV (jugular externa — 1ª escolha!), IM (tábua do pescoço / peitoral / glúteo — máx 15–20 mL por ponto!), VO (sonda nasogástrica / pasta)",
    proibido: "⛔ 100% LETAL: Clindamicina, Lincomicina, Eritromicina oral e Amoxicilina oral em adultos (colite necrosante fatal por Clostridium difficile/perfringens!). ⛔ Proibido Doxiciclina IV (arritmia/morte súbita!) e Metoclopramida (excitação extrapiramidal severa!).",
    regraOuro: "Equine Medicine Secrets / Plumb's 10ª ed.: Na SÍNDROME CÓLICA: 1) Sondagem nasogástrica imediata (avaliar refluxo enterogástrico!); 2) Analgesia: Escopolamina (0,3 mg/kg IV) + Dipirona (25 mg/kg IV) + Flunixin/Meloxicam (0,6 mg/kg IV); 3) Aferir lactato e FC (> 60 bpm + refluxo + dor refratária = avaliação cirúrgica!). Na úlcera gástrica (EGUS): Omeprazol 4 mg/kg VO SID!",
    subespecies: [
      { nome: "Cavalo Adulto (Equus caballus — 350 a 550 kg)", peso: 450.0, unid: "kg", alerta: "Pentabiótico IM profunda: dividir em múltiplos pontos (máx 15–20 mL/local) e ASPIRAR sempre (Procaína IV é fatal!)." },
      { nome: "Potro / Pônei (40 a 180 kg)", peso: 120.0, unid: "kg", alerta: "🚨 POTROS / PÔNEIS: Evitar Enrofloxacina em potros em crescimento (artropatia erosiva!); em pôneis anoréxicos, monitorar triglicerídeos (hiperlipidemia!)." },
      { nome: "Zebra (Equus quagga / E. grevyi — 250 a 380 kg)", peso: 300.0, unid: "kg", alerta: "Cubas Cap. 46 / West 3ª ed.: Equídeo selvagem de fuga explosiva; contenção química especializada com dardo e reversores." },
      { nome: "Asinino / Muar (Equus asinus — 150 a 300 kg)", peso: 220.0, unid: "kg", alerta: "Asininos mascaram sinais de dor e desenvolvem hiperlipidemia fatal rapidamente sob jejum ou estresse!" }
    ],
    sedacao: [
      { nome: "Sedação em Estação (Cólica / Curativos / Odontologia)", drogas: [["Butorfanol", 0.05], ["Midazolam", 0.05]], via: "IV (associar Xilazina 0,5 mg/kg ou Detomidina 0,01 mg/kg IV)", obs: "Equine Medicine Secrets. Nunca aplicar Midazolam IV isolado em equino adulto hígido (causa ataxia/queda!)." },
      { nome: "Indução Anestésica Curta (Pós-Alfa-2 IV)", drogas: [["Cetamina", 2.2], ["Midazolam", 0.05]], via: "IV rápido (somente após sedação profunda com Xilazina/Detomidina!)", obs: "Padrão-ouro de indução a campo." }
    ],
    eutanasia: {
      etapa1: ["Sedação profunda com Alfa-2 IV + Cetamina (2.2 mg/kg) + Midazolam (0.05 mg/kg) IV", 2.2, 100, 0.05, 5],
      etapa2: ["Tiopental/Propofol IV (ou superdosagem barbitúrica) até apneia e perda total de reflexo corneal", 4, 10],
      etapa3: ["KCl 19,1% (0.5 a 1 mL/kg IV rápido na jugular) EXCLUSIVAMENTE após plano anestésico profundo confirmado!", 0.75]
    }
  },
  // 34: TestudinesMarinhos
  {
    id: "TestudinesMarinhos", grupo: "Répteis — Testudines Marinhos", nome: "🐢 Tartarugas Marinhas (Verde, Cabeçuda, De-pente, Oliva)",
    tMin: 22.0, tBasalMin: 24.0, tMax: 28.0, fluidoManut: 15, bolusChoque: 5, fatorK: 10, gavMax: 10,
    tuboSangue: "⚠️ OBRIGATÓRIO HEPARINA DE LÍTIO (EDTA lisa hemácias!). Coleta: Seio Cervical Dorsal (lateral ao pescoço).",
    vias: "IV (seio cervical dorsal), IM (musculatura das nadadeiras anteriores — deltoide/peitoral), SC (fossa pré-femoral / axilar), ICe, VO",
    proibido: "⛔ PROIBIDO IVERMECTINA E TODAS AS AVERMECTINAS (100% LETAL em todos os quelônios — paralisia flácida irreversível!). Proibido corticoides e Pentabiótico.",
    regraOuro: "Cubas Cap. 17: Manter fora da água em colchão úmido quando debilitada (risco de afogamento!) até recuperar força natatória. Em desidratação marinha (hipernatremia): preferir solução hiposmolar (NaCl 0,45% + Glicose 2,5% ou RL diluído). Investigar ingestão de plástico/anzol (RX) e Fibropapilomatose.",
    subespecies: [
      { nome: "Tartaruga-verde (Chelonia mydas — 5 a 80 kg)", peso: 18.0, unid: "kg", alerta: "Alta incidência de Fibropapilomatose (tumores cutâneos/oculares) e impacção por lixo marinho." },
      { nome: "Tartaruga-cabeçuda (Caretta caretta — 25 a 110 kg)", peso: 55.0, unid: "kg", alerta: "Mordida de altíssima pressão; frequente ingestão de anzóis de espinhel." },
      { nome: "Tartaruga-de-pente (Eretmochelys imbricata — 15 a 60 kg)", peso: 30.0, unid: "kg", alerta: "" },
      { nome: "Tartaruga-oliva (Lepidochelys olivacea — 20 a 45 kg)", peso: 32.0, unid: "kg", alerta: "" }
    ],
    sedacao: [
      { nome: "Sedação / Endoscopia / Retirada de Anzol", drogas: [["Cetamina", 15.0], ["Midazolam", 1.5]], via: "IM nas nadadeiras anteriores (ou Propofol 3–5 mg/kg IV no seio cervical)", obs: "Cubas Cap. 17. Manter cabeça elevada fora d'água até retorno completo dos reflexos!" }
    ],
    eutanasia: {
      etapa1: ["Cetamina (25 mg/kg) + Midazolam (2 mg/kg) IM nas nadadeiras anteriores", 25, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV no seio cervical dorsal) até apneia e perda de reflexos", 10, 10],
      etapa3: ["KCl 19,1% (1.5 mL/kg IV no seio cervical dorsal) após plano profundo.", 1.5]
    }
  },
  // 35: Sphenisciformes
  {
    id: "Sphenisciformes", grupo: "Aves — Sphenisciformes (Marinhas)", nome: "🐧 Pinguins (Pinguim-de-Magalhães)",
    tMin: 38.0, tBasalMin: 38.5, tMax: 40.0, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 20,
    tuboSangue: "Tubo Heparina de Lítio (Veia Jugular Direita ou Metatarsal Dorsal/Medial — fazer esfregaço p/ Malária Aviária!)",
    vias: "IV (jugular direita, metatarsal medial), SC (interescapular/inguinal), IM (peitoral), VO (sonda flexível ou peixe medicado)",
    proibido: "⛔ PROIBIDO CORTICOIDES (Aspergilose fulminante — principal causa de morte em pinguins reabilitados!). ⛔ Proibido Pentabiótico, tubo traqueal com cuff e superaquecimento em salas quentes!",
    regraOuro: "Cubas Cap. 22 / Carpenter 6ª ed.: 1) No encalhe hipotérmico/caquético: aquecer primeiro até >= 38 °C + hidratação morna antes de alimentar com peixe sólido; 2) Iniciar ITRACONAZOL (10 mg/kg VO) profilático/terapêutico contra Aspergilose; 3) Pesquisar Plasmodium (Malária Aviária); 4) Em cativeiro de água doce, suplementar NaCl (sal) p/ preservar a glândula de sal!",
    subespecies: [
      { nome: "Pinguim-de-Magalhães Juvenil / Encalhe (Spheniscus magellanicus — 2.0 a 3.5 kg)", peso: 2.6, unid: "kg", alerta: "🚨 ENCALHE COSTEIRO: Aquecer gradualmente -> hidratar -> papa/peixe só após normotermia! Risco máximo de Aspergilose e Malária Aviária." },
      { nome: "Pinguim-de-Magalhães Adulto (Spheniscus magellanicus — 3.5 a 5.0 kg)", peso: 4.2, unid: "kg", alerta: "Manter recinto fresco (18–22 °C) e piso acolchoado/piscina p/ prevenir pododermatite (bumblefoot)." }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ RX, Coleta e Curativo de Bumblefoot", drogas: [["Midazolam", 1.0], ["Butorfanol", 1.0]], via: "IM ou Intranasal", obs: "Monitorar temperatura para evitar hipertermia durante contenção." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1.5 mg/kg) IM", 15, 100, 1.5, 5],
      etapa2: ["Propofol (10 mg/kg IV na jugular direita) até arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  // 36: BovideosSilv
  {
    id: "BovideosSilv", grupo: "Artiodactyla — Bovidae (Ruminantes)", nome: "🐃 Bovídeos Silvestres & Antílopes (Bisão, Antílope, Gnu, Kudu, Aoudad)",
    tMin: 38.0, tBasalMin: 38.2, tMax: 39.5, fluidoManut: 45, bolusChoque: 15, fatorK: 70, gavMax: 20,
    tuboSangue: "Tubo EDTA + Vermelha/Amarela (Veia Jugular Externa ou Coccígea Ventral)",
    vias: "IV (jugular externa, auricular), IM (glúteo/pescoço — dardo ou tronco de contenção), SC, VO (evitar ATBs que destruam o rúmen!)",
    proibido: "⛔ PROIBIDO antimicrobianos orais beta-lactâmicos/lincosamidas em adultos (Amoxi+Clav VO, Clindamicina, Cefalexina VO destroem microbiota ruminal!). ⛔ PROIBIDO decúbito lateral prolongado (timpanismo ruminal + aspiração!).",
    regraOuro: "Cubas Cap. 52 / West 3ª ed.: Ruminantes estritos — manter SEMPRE em decúbito esternal com cabeça elevada e focinho baixo na anestesia! Em antílopes, risco extremo de MIOPATIA DE CAPTURA e hipertermia (monitorar T retal e CK).",
    subespecies: [
      { nome: "Antílope-negro / Gazela / Impala (30 a 70 kg)", peso: 45.0, unid: "kg", alerta: "Risco extremo de miopatia de captura e fratura de membros em manejo estressante." },
      { nome: "Aoudad / Carneiro-da-barbária (Ammotragus lervia — 60 a 130 kg)", peso: 85.0, unid: "kg", alerta: "" },
      { nome: "Eland / Kudu / Gnu / Waterbuck (180 a 450 kg)", peso: 250.0, unid: "kg", alerta: "Grandes bovídeos: posicionamento esternal obrigatório e suporte respiratório." },
      { nome: "Bisão / Búfalo (Bison / Bubalus — 450 a 800 kg)", peso: 600.0, unid: "kg", alerta: "Contenção química com dardo de alto calibre ou tronco hidráulico." }
    ],
    sedacao: [
      { nome: "Contenção Química Balanceada (Pequenos/Médios Bovídeos)", drogas: [["Cetamina", 4.0], ["Midazolam", 0.3], ["Butorfanol", 0.2]], via: "IM (dardo ou contenção)", obs: "West 3ª ed. / Cubas Cap. 52. Associar Alfa-2 se hígido (reversor pronto!)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (6 mg/kg) + Midazolam (0.3 mg/kg) IM", 6, 100, 0.3, 5],
      etapa2: ["Propofol (5 mg/kg IV na jugular) até apneia e arreflexia", 5, 10],
      etapa3: ["KCl 19,1% (0.75 mL/kg IV na jugular) após plano profundo.", 0.75]
    }
  },
  // 37: Camelideos
  {
    id: "Camelideos", grupo: "Artiodactyla — Camelidae (Pseudorruminantes)", nome: "🦙 Camelídeos Neotropicais (Lhama, Alpaca, Guanaco, Vicunha)",
    tMin: 37.5, tBasalMin: 37.8, tMax: 38.9, fluidoManut: 45, bolusChoque: 15, fatorK: 70, gavMax: 20,
    tuboSangue: "Tubo EDTA + Vermelha/Amarela (Jugular Direita profunda junto ao processo transverso de C5–C6 — sem sulco jugular visível!)",
    vias: "IV (jugular profunda em C5–C6 ou safena), IM (tríceps/semimembranoso — evitar pele cervical grossa!), SC (axila/parede torácica), VO",
    proibido: "⛔ PROIBIDO antimicrobianos orais beta-lactâmicos/lincosamidas em adultos (disbiose dos compartimentos fermentativos C1–C2!). Evitar superaquecimento (tosquia necessária em climas quentes!).",
    regraOuro: "Cubas Cap. 49 / West 3ª ed.: Pseudorruminantes (3 compartimentos: C1, C2 e C3 — alta incidência de ÚLCERA DE C3 por estresse!). Não têm sulco jugular evidente (puncionar ventralmente ao processo transverso de C5–C6 evitando a artéria carótida!). Hemácias são eliptócitos fisiológicos (VCM baixo).",
    subespecies: [
      { nome: "Alpaca (Vicugna pacos — 50 a 75 kg)", peso: 60.0, unid: "kg", alerta: "Muito sensível ao estresse térmico; manter tosquiada em clima quente e monitorar úlcera de C3." },
      { nome: "Lhama (Lama glama — 110 a 180 kg)", peso: 140.0, unid: "kg", alerta: "Pele cervical espessa (cuidado na punção jugular em C5–C6); machos possuem dentes caninos de luta." },
      { nome: "Guanaco / Vicunha (Lama guanicoe / Vicugna vicugna — 45 a 110 kg)", peso: 75.0, unid: "kg", alerta: "Espécies silvestres altamente suscetíveis à miopatia de captura." }
    ],
    sedacao: [
      { nome: "Contenção Química Balanceada (Exame / Odontologia / Transporte)", drogas: [["Cetamina", 5.0], ["Midazolam", 0.3], ["Butorfanol", 0.2]], via: "IM (tríceps ou coxa)", obs: "Cubas Cap. 49 / West 3ª ed. Manter decúbito esternal (posição kush)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (8 mg/kg) + Midazolam (0.4 mg/kg) IM", 8, 100, 0.4, 5],
      etapa2: ["Propofol (5 mg/kg IV na jugular) até apneia e arreflexia", 5, 10],
      etapa3: ["KCl 19,1% (0.75 mL/kg IV na jugular) após plano profundo.", 0.75]
    }
  }
);

// 4. Referências Laboratoriais (LAB_REF_DB) para Todos os 17 Novos Táxons (Campbell / Cubas / Fowler)
Object.assign(LAB_REF_DB, {
  FelideosSilv:      { ht:[32,48], ppt:[6.0,8.2], glic:[75,160],  renalNome:"Creatinina (mg/dL)", renal:[0.9,2.2], hepNome:"ALT (U/L)", hep:[15,110], nota:"Felídeos silvestres (Cubas Cap. 37 / Fowler): grande massa muscular eleva creatinina basal discretamente; hiperglicemia de estresse comum." },
  Mustelideos:       { ht:[42,58], ppt:[5.2,7.4], glic:[85,140],  renalNome:"Creatinina (mg/dL)", renal:[0.2,0.8], hepNome:"ALT (U/L)", hep:[40,180], nota:"🚨 Ferrets (BSAVA / Campbell): Ht fisiológico alto (42–58%); Glicemia < 70 mg/dL = forte suspeita de insulinoma; Creatinina > 1,0 já indica azotemia!" },
  Lagartos:          { ht:[24,40], ppt:[3.5,7.5], glic:[60,180],  renalNome:"Ác. Úrico (mg/dL)",  renal:[1.5,9.0], hepNome:"AST (U/L)", hep:[20,120], nota:"Sauria (Campbell / Cubas Cap. 14): uricotélicos; avaliar relação Cálcio:Fósforo (> 1,5:1) na suspeita de DOM!" },
  Crocodilianos:     { ht:[18,34], ppt:[3.5,6.5], glic:[55,140],  renalNome:"Ác. Úrico (mg/dL)",  renal:[1.5,9.5], hepNome:"AST (U/L)", hep:[20,150], nota:"🚨 Crocodylia (Cubas Cap. 13 / Campbell): usar Heparina de Lítio (EDTA causa hemólise); coleta padrão no Seio Occipital!" },
  Cervideos:         { ht:[35,52], ppt:[5.8,7.8], glic:[70,160],  renalNome:"Creatinina (mg/dL)", renal:[0.8,2.0], hepNome:"AST (U/L)", hep:[50,180], nota:"🚨 Cervidae (Cubas Cap. 51): avaliar CK + AST na suspeita de Miopatia de Captura (CK > 2.000 U/L = rabdomiólise grave!)." },
  Tapiridae:         { ht:[28,44], ppt:[6.0,8.0], glic:[70,130],  renalNome:"Creatinina (mg/dL)", renal:[0.8,1.8], hepNome:"AST (U/L)", hep:[60,220], nota:"Tapiridae (Cubas Cap. 47 / Fowler): avaliar AST e GGT para fígado (ALT tem baixa especificidade em perissodáctilos)." },
  Ratitas:           { ht:[38,52], ppt:[3.2,5.2], glic:[170,300], renalNome:"Ác. Úrico (mg/dL)",  renal:[3.0,12.0],hepNome:"AST (U/L)", hep:[120,380],nota:"Ratitas (Cubas Cap. 18 / Campbell): monitorar CK + AST p/ miopatia de captura; uricotélicos (avaliar Ácido Úrico!)." },
  Anseriformes:      { ht:[38,52], ppt:[3.2,5.2], glic:[180,320], renalNome:"Ác. Úrico (mg/dL)",  renal:[3.0,12.0],hepNome:"AST (U/L)", hep:[40,180], nota:"🚨 Anseriformes (Campbell): usar Heparina de Lítio (EDTA lisa hemácias em muitos patos/gansos/cisnes!)." },
  Galliformes:       { ht:[32,48], ppt:[3.5,5.5], glic:[180,320], renalNome:"Ác. Úrico (mg/dL)",  renal:[2.5,10.0],hepNome:"AST (U/L)", hep:[100,280],nota:"Galliformes/Tinamiformes (Campbell / Cubas Cap. 21): uricotélicos; avaliar AST + CK em conjunto." },
  Tayassuidae:       { ht:[32,48], ppt:[6.0,8.0], glic:[70,130],  renalNome:"Creatinina (mg/dL)", renal:[0.8,2.2], hepNome:"ALT (U/L)", hep:[25,85],  nota:"Tayassuidae & Suidae (Cubas Cap. 48): avaliar CK na suspeita de estresse térmico / hipertermia." },
  Apodiformes:       { ht:[48,62], ppt:[2.5,4.5], glic:[300,650], renalNome:"Ác. Úrico (mg/dL)",  renal:[2.5,11.0],hepNome:"AST (U/L)", hep:[130,380],nota:"🚨 Beija-flores (Cubas Cap. 29): glicemia fisiológica altíssima (300–650 mg/dL); coleta de sangue raramente segura em aves < 10 g!" },
  Anfibios:          { ht:[20,40], ppt:[2.5,6.0], glic:[20,70],   renalNome:"Ác. Úrico (mg/dL)",  renal:[0.5,4.0], hepNome:"AST (U/L)", hep:[30,180], nota:"Anfíbios (Cubas Cap. 12 / Campbell): hemácias nucleadas grandes; espécies aquáticas excretam amônia e terrestres ureia." },
  Equideos:          { ht:[32,48], ppt:[5.8,7.8], glic:[75,115],  renalNome:"Creatinina (mg/dL)", renal:[0.9,1.9], hepNome:"AST (U/L)", hep:[150,380],nota:"Equidae (Equine Medicine Secrets): ALT tem pouco valor hepático — avaliar AST, GGT, SDH e Lactato (< 2 mmol/L na cólica!)." },
  TestudinesMarinhos:{ ht:[24,40], ppt:[3.0,5.5], glic:[60,130],  renalNome:"Ác. Úrico (mg/dL)",  renal:[0.5,3.0], hepNome:"AST (U/L)", hep:[80,350], nota:"🚨 Tartarugas Marinhas (Cubas Cap. 17 / Campbell): usar Heparina de Lítio! Avaliar sódio/eletrólitos em encalhes desidratados." },
  Sphenisciformes:   { ht:[40,54], ppt:[4.0,6.2], glic:[180,300], renalNome:"Ác. Úrico (mg/dL)",  renal:[4.0,15.0],hepNome:"AST (U/L)", hep:[120,350],nota:"🚨 Pinguins (Cubas Cap. 22): Ác. Úrico sobe pós-refeição de peixe; realizar esfregaço sanguíneo p/ Malária Aviária (Plasmodium)!" },
  BovideosSilv:      { ht:[32,48], ppt:[6.0,8.0], glic:[60,120],  renalNome:"Creatinina (mg/dL)", renal:[1.0,2.2], hepNome:"AST (U/L)", hep:[60,160], nota:"Bovidae (Cubas Cap. 52): avaliar AST + GGT (fígado) e CK (miopatia de captura)." },
  Camelideos:        { ht:[26,42], ppt:[5.5,7.5], glic:[90,150],  renalNome:"Creatinina (mg/dL)", renal:[1.0,2.4], hepNome:"AST (U/L)", hep:[120,300],nota:"Camelidae (Cubas Cap. 49): hemácias elípticas (eliptócitos fisiológicos c/ VCM baixo); glicemia basal maior que bovinos!" }
});

// 5. Protocolos XABCDE — Particularidades Clínicas dos Novos Táxons
(function expandirXabcdeNovosTaxons() {
  const etapas = PROTOCOLOS_MESTRES?.xabcde?.etapas || [];
  const porLetra = l => etapas.find(e => e.letra === l)?.porTaxon;

  const pX = porLetra("X");
  if (pX) {
    pX.Equideos = "Em equinos/antas, a volemia é ~8% do PV (35–40 L em cavalo de 450 kg): hemorragias arteriais exigem compressão firme imediata + Ácido Tranexâmico (10 mg/kg IV lento) + reposição volêmica vigorosa.";
  }
  const pA = porLetra("A");
  if (pA) {
    pA.Cervideos = "🚨 RUMINANTES (Cervídeos/Bovídeos): Posicionar IMEDIATAMENTE em DECÚBITO ESTERNAL com cabeça elevada e focinho inclinado para baixo — evita timpanismo ruminal e broncoaspiração letal!";
    pA.BovideosSilv = pA.Cervideos;
    pA.Camelideos = "Manter em decúbito esternal ('posição kush') com pescoço estendido e cabeça baixa para evitar aspiração de regurgito de C1.";
    pA.Tayassuidae = "Laringe angulada com divertículo faríngeo: usar estilete/guia na intubação endotraqueal.";
    pA.Anfibios = "Manter pele sempre úmida com água declorada (respiração cutânea ativa!) e nunca usar álcool/iodo próximo às narinas.";
  }
  const pB = porLetra("B");
  if (pB) {
    pB.Ratitas = "Aves sem quilha esternal: não comprimir o esterno/costelas; manter pescoço longo alinhado sem dobras.";
    pB.Crocodilianos = "Crocodilianos fazem apneia prolongada e possuem septo pós-hepático: ventilar suavemente (2–4 mov/min) com ar ambiente na recuperação.";
  }
  const pC = porLetra("C");
  if (pC) {
    pC.FelideosSilv = "🚨 TRÍADE DO CHOQUE FELINO: Aquecer a >= 37,0 °C antes de expansão volêmica agressiva; proibido Lidocaína IV contínua!";
    pC.Equideos = "Prova de carga em equinos/antas: 15–20 mL/kg de Ringer Lactato (ou Salina Hipertônica 7,5% 4 mL/kg seguida de cristaloide isotônico) via cateter 14G na jugular.";
    pC.Anfibios = "Reidratação segura por banho raso em água declorada / Ringer de Anfíbio ou via intracelômica (ICe) no quadrante caudal.";
  }
  const pE = porLetra("E");
  if (pE) {
    pE.Cervideos = "🚨 HIPERTERMIA / MIOPATIA DE CAPTURA: Se T > 40,5 °C, resfriar imediatamente com água fria nas axilas/virilhas, O2 e fluido!";
    pE.BovideosSilv = pE.Cervideos;
    pE.Tayassuidae = "Suínos e Taiassuídeos não suam com eficiência: monitorar T retal continuamente e resfriar se > 40,0 °C!";
    pE.Apodiformes = "🚨 BEIJA-FLORES: Diferenciar TORPOR NOTURNO FISIOLÓGICO (18–25 °C) de hipotermia letal e oferecer néctar 20% a cada 15–20 min!";
    pE.Sphenisciformes = "Pinguins sob contenção superaquecem rapidamente em salas quentes (manter 18–22 °C); no encalhe hipotérmico, aquecer antes de dar peixe sólido.";
  }
})();

// 6. Matriz Completa e Sincronizada de Doses por ID Nominal (38 Fármacos × 17 Novos Táxons)
// Fontes: Carpenter's 6ª ed., Tratado de Animais Selvagens (Cubas 2ª ed.), West 3ª ed., Plumb's 10ª ed., Equine Medicine Secrets, Spinosa 6ª ed.
const NOVAS_DOSES_POR_FARMACO = {
  "Amoxicilina+Clav":    { FelideosSilv:15,   Mustelideos:15,   Lagartos:22,  Crocodilianos:22,  Cervideos:0,     Tapiridae:0,     Ratitas:25,    Anseriformes:125, Galliformes:125, Tayassuidae:15,    Apodiformes:125, Anfibios:20,   Equideos:0,     TestudinesMarinhos:22,  Sphenisciformes:125, BovideosSilv:0,     Camelideos:0     },
  "Clindamicina":        { FelideosSilv:11,   Mustelideos:11,   Lagartos:5,   Crocodilianos:5,   Cervideos:0,     Tapiridae:0,     Ratitas:25,    Anseriformes:100, Galliformes:100, Tayassuidae:10,    Apodiformes:100, Anfibios:0,    Equideos:0,     TestudinesMarinhos:5,   Sphenisciformes:100, BovideosSilv:0,     Camelideos:0     },
  "Enrofloxacina":       { FelideosSilv:5,    Mustelideos:5,    Lagartos:5,   Crocodilianos:5,   Cervideos:5,     Tapiridae:5,     Ratitas:10,    Anseriformes:15,  Galliformes:10,  Tayassuidae:5,     Apodiformes:15,  Anfibios:5,    Equideos:5,     TestudinesMarinhos:5,   Sphenisciformes:15,  BovideosSilv:5,     Camelideos:5     },
  "Marbofloxacina":      { FelideosSilv:2.75, Mustelideos:5,    Lagartos:10,  Crocodilianos:10,  Cervideos:2.75,  Tapiridae:2.75,  Ratitas:5,     Anseriformes:10,  Galliformes:10,  Tayassuidae:2.75,  Apodiformes:10,  Anfibios:10,   Equideos:2.0,   TestudinesMarinhos:10,  Sphenisciformes:10,  BovideosSilv:2.75,  Camelideos:2.75  },
  "Ceftazidima":         { FelideosSilv:25,   Mustelideos:25,   Lagartos:20,  Crocodilianos:20,  Cervideos:20,    Tapiridae:20,    Ratitas:50,    Anseriformes:75,  Galliformes:75,  Tayassuidae:20,    Apodiformes:75,  Anfibios:20,   Equideos:25,    TestudinesMarinhos:20,  Sphenisciformes:75,  BovideosSilv:20,    Camelideos:20    },
  "Doxiciclina":         { FelideosSilv:10,   Mustelideos:10,   Lagartos:10,  Crocodilianos:10,  Cervideos:10,    Tapiridae:0,     Ratitas:20,    Anseriformes:35,  Galliformes:35,  Tayassuidae:10,    Apodiformes:35,  Anfibios:10,   Equideos:0,     TestudinesMarinhos:25,  Sphenisciformes:35,  BovideosSilv:10,    Camelideos:10    },
  "Metronidazol":        { FelideosSilv:10,   Mustelideos:15,   Lagartos:20,  Crocodilianos:20,  Cervideos:15,    Tapiridae:15,    Ratitas:20,    Anseriformes:25,  Galliformes:25,  Tayassuidae:15,    Apodiformes:25,  Anfibios:20,   Equideos:15,    TestudinesMarinhos:20,  Sphenisciformes:25,  BovideosSilv:15,    Camelideos:15    },
  "Dipirona":            { FelideosSilv:15,   Mustelideos:25,   Lagartos:25,  Crocodilianos:25,  Cervideos:25,    Tapiridae:25,    Ratitas:25,    Anseriformes:25,  Galliformes:25,  Tayassuidae:25,    Apodiformes:25,  Anfibios:10,   Equideos:25,    TestudinesMarinhos:20,  Sphenisciformes:25,  BovideosSilv:25,    Camelideos:25    },
  "Meloxicam":           { FelideosSilv:0.05, Mustelideos:0.2,  Lagartos:0.2, Crocodilianos:0.2, Cervideos:0.5,   Tapiridae:0.6,   Ratitas:0.5,   Anseriformes:1.0, Galliformes:1.0, Tayassuidae:0.4,   Apodiformes:1.0, Anfibios:0.2,  Equideos:0.6,   TestudinesMarinhos:0.2, Sphenisciformes:0.5, BovideosSilv:0.5,   Camelideos:0.5   },
  "Tramadol":            { FelideosSilv:2,    Mustelideos:3,    Lagartos:5,   Crocodilianos:5,   Cervideos:2,     Tapiridae:2,     Ratitas:5,     Anseriformes:10,  Galliformes:10,  Tayassuidae:2,     Apodiformes:10,  Anfibios:10,   Equideos:2,     TestudinesMarinhos:5,   Sphenisciformes:5,   BovideosSilv:2,     Camelideos:2     },
  "Gabapentina":         { FelideosSilv:10,   Mustelideos:10,   Lagartos:10,  Crocodilianos:10,  Cervideos:10,    Tapiridae:10,    Ratitas:10,    Anseriformes:15,  Galliformes:15,  Tayassuidae:10,    Apodiformes:15,  Anfibios:10,   Equideos:10,    TestudinesMarinhos:10,  Sphenisciformes:15,  BovideosSilv:10,    Camelideos:10    },
  "Butorfanol":          { FelideosSilv:0.3,  Mustelideos:0.3,  Lagartos:1.0, Crocodilianos:1.0, Cervideos:0.2,   Tapiridae:0.15,  Ratitas:0.5,   Anseriformes:1.5, Galliformes:1.5, Tayassuidae:0.2,   Apodiformes:2.0, Anfibios:0.5,  Equideos:0.05,  TestudinesMarinhos:1.0, Sphenisciformes:1.0, BovideosSilv:0.2,   Camelideos:0.2   },
  "Metadona":            { FelideosSilv:0.2,  Mustelideos:0.2,  Lagartos:1.0, Crocodilianos:0.5, Cervideos:0.1,   Tapiridae:0.1,   Ratitas:0.5,   Anseriformes:1.0, Galliformes:1.0, Tayassuidae:0.15,  Apodiformes:1.0, Anfibios:0,    Equideos:0.1,   TestudinesMarinhos:0.5, Sphenisciformes:1.0, BovideosSilv:0.1,   Camelideos:0.1   },
  "Midazolam":           { FelideosSilv:0.3,  Mustelideos:0.5,  Lagartos:1.5, Crocodilianos:1.0, Cervideos:0.3,   Tapiridae:0.2,   Ratitas:0.5,   Anseriformes:1.5, Galliformes:1.5, Tayassuidae:0.4,   Apodiformes:2.0, Anfibios:1.0,  Equideos:0.05,  TestudinesMarinhos:1.5, Sphenisciformes:1.0, BovideosSilv:0.3,   Camelideos:0.3   },
  "Cetamina":            { FelideosSilv:5,    Mustelideos:8,    Lagartos:15,  Crocodilianos:15,  Cervideos:5,     Tapiridae:3,     Ratitas:10,    Anseriformes:15,  Galliformes:15,  Tayassuidae:10,    Apodiformes:15,  Anfibios:30,   Equideos:2.2,   TestudinesMarinhos:15,  Sphenisciformes:10,  BovideosSilv:4,     Camelideos:5     },
  "Maropitant":          { FelideosSilv:1.0,  Mustelideos:1.0,  Lagartos:1.0, Crocodilianos:1.0, Cervideos:0,     Tapiridae:0,     Ratitas:1.0,   Anseriformes:1.0, Galliformes:1.0, Tayassuidae:1.0,   Apodiformes:1.0, Anfibios:0,    Equideos:0,     TestudinesMarinhos:1.0, Sphenisciformes:1.0, BovideosSilv:0,     Camelideos:0     },
  "Furosemida":          { FelideosSilv:1.5,  Mustelideos:2.0,  Lagartos:2.0, Crocodilianos:2.0, Cervideos:2.0,   Tapiridae:1.0,   Ratitas:0.2,   Anseriformes:0.2, Galliformes:0.2, Tayassuidae:2.0,   Apodiformes:0.2, Anfibios:2.0,  Equideos:1.0,   TestudinesMarinhos:2.0, Sphenisciformes:0.2, BovideosSilv:2.0,   Camelideos:2.0   },
  "Nitenpiram":          { FelideosSilv:1.0,  Mustelideos:1.0,  Lagartos:0,   Crocodilianos:0,   Cervideos:0,     Tapiridae:0,     Ratitas:1.0,   Anseriformes:1.0, Galliformes:1.0, Tayassuidae:1.0,   Apodiformes:1.0, Anfibios:0,    Equideos:0,     TestudinesMarinhos:0,   Sphenisciformes:1.0, BovideosSilv:0,     Camelideos:0     },
  "Manitol 20%":         { FelideosSilv:500,  Mustelideos:500,  Lagartos:500, Crocodilianos:500, Cervideos:500,   Tapiridae:500,   Ratitas:500,   Anseriformes:500, Galliformes:500, Tayassuidae:500,   Apodiformes:500, Anfibios:0,    Equideos:500,   TestudinesMarinhos:500, Sphenisciformes:500, BovideosSilv:500,   Camelideos:500   },
  "Vitamina K1":         { FelideosSilv:2.5,  Mustelideos:2.0,  Lagartos:1.0, Crocodilianos:1.0, Cervideos:1.0,   Tapiridae:1.0,   Ratitas:2.0,   Anseriformes:2.5, Galliformes:2.5, Tayassuidae:2.0,   Apodiformes:2.5, Anfibios:1.0,  Equideos:1.0,   TestudinesMarinhos:1.0, Sphenisciformes:2.5, BovideosSilv:1.0,   Camelideos:1.0   },
  "Carprofeno":          { FelideosSilv:0,    Mustelideos:2.0,  Lagartos:2.0, Crocodilianos:2.0, Cervideos:1.4,   Tapiridae:0.7,   Ratitas:2.0,   Anseriformes:2.0, Galliformes:2.0, Tayassuidae:2.2,   Apodiformes:2.0, Anfibios:0,    Equideos:0.7,   TestudinesMarinhos:2.0, Sphenisciformes:2.0, BovideosSilv:1.4,   Camelideos:1.4   },
  "Robenacoxibe":        { FelideosSilv:2.0,  Mustelideos:2.0,  Lagartos:0,   Crocodilianos:0,   Cervideos:0,     Tapiridae:0,     Ratitas:0,     Anseriformes:0,   Galliformes:0,   Tayassuidae:2.0,   Apodiformes:0,   Anfibios:0,    Equideos:0,     TestudinesMarinhos:0,   Sphenisciformes:0,   BovideosSilv:0,     Camelideos:0     },
  "Prednisolona":        { FelideosSilv:1.0,  Mustelideos:1.0,  Lagartos:0,   Crocodilianos:0,   Cervideos:0,     Tapiridae:0,     Ratitas:0,     Anseriformes:0,   Galliformes:0,   Tayassuidae:0.5,   Apodiformes:0,   Anfibios:0,    Equideos:1.0,   TestudinesMarinhos:0,   Sphenisciformes:0,   BovideosSilv:0,     Camelideos:0     },
  "Dexametasona":        { FelideosSilv:0.15, Mustelideos:0.15, Lagartos:0,   Crocodilianos:0,   Cervideos:0.1,   Tapiridae:0.1,   Ratitas:0,     Anseriformes:0,   Galliformes:0,   Tayassuidae:0.1,   Apodiformes:0,   Anfibios:0,    Equideos:0.05,  TestudinesMarinhos:0,   Sphenisciformes:0,   BovideosSilv:0.1,   Camelideos:0.1   },
  "Lidocaina 2%":        { FelideosSilv:2.0,  Mustelideos:2.0,  Lagartos:2.0, Crocodilianos:2.0, Cervideos:4.0,   Tapiridae:2.0,   Ratitas:1.5,   Anseriformes:1.5, Galliformes:1.5, Tayassuidae:4.0,   Apodiformes:1.5, Anfibios:0,    Equideos:1.5,   TestudinesMarinhos:2.0, Sphenisciformes:1.5, BovideosSilv:4.0,   Camelideos:4.0   },
  "Bupivacaina 0,5%":    { FelideosSilv:1.0,  Mustelideos:1.0,  Lagartos:1.0, Crocodilianos:1.0, Cervideos:1.5,   Tapiridae:1.0,   Ratitas:1.0,   Anseriformes:1.0, Galliformes:1.0, Tayassuidae:1.5,   Apodiformes:1.0, Anfibios:0,    Equideos:1.0,   TestudinesMarinhos:1.0, Sphenisciformes:1.0, BovideosSilv:1.5,   Camelideos:1.5   },
  "Ondansetrona":        { FelideosSilv:0.5,  Mustelideos:0.5,  Lagartos:0.5, Crocodilianos:0.5, Cervideos:0,     Tapiridae:0,     Ratitas:0.5,   Anseriformes:0.5, Galliformes:0.5, Tayassuidae:0.5,   Apodiformes:0.5, Anfibios:0,    Equideos:0,     TestudinesMarinhos:0.5, Sphenisciformes:0.5, BovideosSilv:0,     Camelideos:0     },
  "Metoclopramida":      { FelideosSilv:0.3,  Mustelideos:0.4,  Lagartos:0.5, Crocodilianos:0.5, Cervideos:0,     Tapiridae:0,     Ratitas:0.5,   Anseriformes:0.5, Galliformes:0.5, Tayassuidae:0.4,   Apodiformes:0.5, Anfibios:0,    Equideos:0,     TestudinesMarinhos:0.5, Sphenisciformes:0.5, BovideosSilv:0,     Camelideos:0     },
  "Omeprazol":           { FelideosSilv:1.0,  Mustelideos:1.0,  Lagartos:1.0, Crocodilianos:1.0, Cervideos:0,     Tapiridae:2.0,   Ratitas:1.0,   Anseriformes:1.0, Galliformes:1.0, Tayassuidae:1.0,   Apodiformes:1.0, Anfibios:0,    Equideos:4.0,   TestudinesMarinhos:1.0, Sphenisciformes:1.0, BovideosSilv:0,     Camelideos:1.0   },
  "Sucralfato":          { FelideosSilv:25,   Mustelideos:25,   Lagartos:25,  Crocodilianos:25,  Cervideos:0,     Tapiridae:20,    Ratitas:25,    Anseriformes:25,  Galliformes:25,  Tayassuidae:25,    Apodiformes:25,  Anfibios:0,    Equideos:20,    TestudinesMarinhos:25,  Sphenisciformes:25,  BovideosSilv:0,     Camelideos:20    },
  "Itraconazol":         { FelideosSilv:10,   Mustelideos:10,   Lagartos:5,   Crocodilianos:5,   Cervideos:0,     Tapiridae:0,     Ratitas:10,    Anseriformes:10,  Galliformes:10,  Tayassuidae:5,     Apodiformes:10,  Anfibios:5,    Equideos:5,     TestudinesMarinhos:5,   Sphenisciformes:10,  BovideosSilv:0,     Camelideos:0     },
  "Alopurinol":          { FelideosSilv:10,   Mustelideos:10,   Lagartos:20,  Crocodilianos:20,  Cervideos:0,     Tapiridae:0,     Ratitas:15,    Anseriformes:15,  Galliformes:15,  Tayassuidae:10,    Apodiformes:15,  Anfibios:0,    Equideos:0,     TestudinesMarinhos:20,  Sphenisciformes:15,  BovideosSilv:0,     Camelideos:0     },
  "Ivermectina":         { FelideosSilv:0.2,  Mustelideos:0.2,  Lagartos:0.2, Crocodilianos:0,   Cervideos:0.2,   Tapiridae:0.2,   Ratitas:0.2,   Anseriformes:0.2, Galliformes:0.2, Tayassuidae:0.3,   Apodiformes:0.2, Anfibios:0.2,  Equideos:0.2,   TestudinesMarinhos:0,   Sphenisciformes:0.2, BovideosSilv:0.2,   Camelideos:0.2   },
  "Fenbendazol":         { FelideosSilv:50,   Mustelideos:50,   Lagartos:50,  Crocodilianos:50,  Cervideos:10,    Tapiridae:10,    Ratitas:15,    Anseriformes:20,  Galliformes:20,  Tayassuidae:10,    Apodiformes:20,  Anfibios:50,   Equideos:10,    TestudinesMarinhos:50,  Sphenisciformes:20,  BovideosSilv:10,    Camelideos:10    },
  "Sulfametoxazol+Trim": { FelideosSilv:15,   Mustelideos:15,   Lagartos:25,  Crocodilianos:25,  Cervideos:25,    Tapiridae:25,    Ratitas:25,    Anseriformes:30,  Galliformes:30,  Tayassuidae:25,    Apodiformes:30,  Anfibios:25,   Equideos:25,    TestudinesMarinhos:25,  Sphenisciformes:30,  BovideosSilv:25,    Camelideos:25    },
  "Cefalexina":          { FelideosSilv:22,   Mustelideos:20,   Lagartos:20,  Crocodilianos:20,  Cervideos:0,     Tapiridae:0,     Ratitas:35,    Anseriformes:50,  Galliformes:50,  Tayassuidae:20,    Apodiformes:50,  Anfibios:20,   Equideos:0,     TestudinesMarinhos:20,  Sphenisciformes:50,  BovideosSilv:0,     Camelideos:0     },
  "Escopolamina":        { FelideosSilv:0.5,  Mustelideos:0.3,  Lagartos:0,   Crocodilianos:0,   Cervideos:0.3,   Tapiridae:0.3,   Ratitas:0,     Anseriformes:0,   Galliformes:0,   Tayassuidae:0.4,   Apodiformes:0,   Anfibios:0,    Equideos:0.3,   TestudinesMarinhos:0,   Sphenisciformes:0,   BovideosSilv:0.3,   Camelideos:0.3   },
  "Pentabiotico":        { FelideosSilv:30000,Mustelideos:30000,Lagartos:0,   Crocodilianos:0,   Cervideos:30000, Tapiridae:30000, Ratitas:0,     Anseriformes:0,   Galliformes:0,   Tayassuidae:30000, Apodiformes:0,   Anfibios:0,    Equideos:30000, TestudinesMarinhos:0,   Sphenisciformes:0,   BovideosSilv:30000, Camelideos:30000 }
};

// 7. Faixas Farmacológicas Específicas para Novos Grupos (Perissodáctilos, Ruminantes, Anfíbios, Ratitas, Pinguins)
(function registrarFaixasNovosGrupos() {
  const byId = id => FARMACOS_DB.find(f => f.id === id);

  const clinda = byId("Clindamicina");
  if (clinda) {
    clinda.faixasPorGrupo.ProibidoPerisso = {
      opcoes: [0], via: "⛔ PROIBIDO EM EQUÍDEOS E ANTAS!", badge: "⛔ 100% LETAL (Colite Clostridial Necrosante!)", status: "proibido",
      fontes: [["Plumb's 10ª Ed., p. 265 & Equine Medicine Secrets", "Clindamycin is strictly contraindicated in horses, zebras, and tapirs due to fatal clostridial enterocolitis.", "📖 Conferido na Fonte"]]
    };
    clinda.faixasPorGrupo.ProibidoRuminante = {
      opcoes: [0], via: "⛔ CONTRAINDICADO EM RUMINANTES E CAMELÍDEOS ADULTOS!", badge: "⛔ Destrói Microbiota Ruminal", status: "proibido",
      fontes: [["Plumb's 10ª Ed. & Cubas (Cap. 51–52)", "Avoid oral lincosamides in adult ruminants and camelids (severe ruminal dysbiosis).", "📖 Conferido na Fonte"]]
    };
  }

  const amoxi = byId("Amoxicilina+Clav");
  if (amoxi) {
    amoxi.faixasPorGrupo.ProibidoPerisso = {
      opcoes: [0], via: "⛔ EVITAR VIA ORAL EM EQUÍDEOS E ANTAS ADULTOS (preferir Pentabiótico IM ou SMZ+TMP)!", badge: "⛔ Risco de Colite em Fermentadores Pós-Gástricos", status: "proibido",
      fontes: [["Plumb's 10ª Ed. & Equine Medicine Secrets", "Oral aminopenicillins disrupt hindgut flora in adult equids and tapirs; use parenteral penicillins or TMS.", "📖 Conferido na Fonte"]]
    };
    amoxi.faixasPorGrupo.ProibidoRuminante = {
      opcoes: [0], via: "⛔ CONTRAINDICADO VIA ORAL EM RUMINANTES ADULTOS (usar Pentabiótico IM ou antibiótico parenteral)!", badge: "⛔ Disbiose Ruminal", status: "proibido",
      fontes: [["Spinosa 6ª Ed. & Cubas (Cap. 51–52)", "Oral beta-lactams impair ruminal fermentation in adult cervids, bovids, and camelids.", "📖 Conferido na Fonte"]]
    };
  }

  const cefal = byId("Cefalexina");
  if (cefal) {
    cefal.faixasPorGrupo.ProibidoPerisso = {
      opcoes: [0], via: "⛔ CONTRAINDICADO VIA ORAL EM EQUÍDEOS E ANTAS!", badge: "⛔ Disbiose Cecocólica", status: "proibido",
      fontes: [["Plumb's 10ª Ed.", "Oral first-generation cephalosporins have poor bioavailability and high colitis risk in adult equids.", "📖 Conferido na Fonte"]]
    };
    cefal.faixasPorGrupo.ProibidoRuminante = {
      opcoes: [0], via: "⛔ CONTRAINDICADO VIA ORAL EM RUMINANTES ADULTOS!", badge: "⛔ Disbiose Ruminal", status: "proibido",
      fontes: [["Plumb's 10ª Ed.", "Avoid oral cephalosporins in adult ruminants.", "📖 Conferido na Fonte"]]
    };
  }

  const melox = byId("Meloxicam");
  if (melox) {
    melox.faixasPorGrupo.Equideos = {
      opcoes: [0.6], via: "IV ou VO a cada 24h (SID) — Preferencial COX-2 em Equídeos e Antas", badge: "⭐ AINE Seletivo COX-2 em Equídeos/Antas (0,6 mg/kg SID)", status: "seguro",
      fontes: [["Plumb's 10ª Ed., p. 791 & Equine Medicine Secrets", "Horses & Tapirs: 0.6 mg/kg IV or PO q24h; safer GI/renal profile than phenylbutazone.", "📖 Conferido na Fonte"]]
    };
    melox.faixasPorGrupo.Tapiridae = melox.faixasPorGrupo.Equideos;
    melox.faixasPorGrupo.Cervideos = {
      opcoes: [0.5, 1.0], via: "IV, SC ou VO a cada 24–48h (Ruminantes/Camelídeos: 0,5 mg/kg)", badge: "⭐ Analgesia/AINE em Ruminantes e Camelídeos", status: "seguro",
      fontes: [["Plumb's 10ª Ed. & Cubas (Cap. 49–52)", "Ruminants & Camelids: 0.5 mg/kg IV/SC q24–48h (or 1 mg/kg PO).", "📖 Conferido na Fonte"]]
    };
    melox.faixasPorGrupo.BovideosSilv = melox.faixasPorGrupo.Cervideos;
    melox.faixasPorGrupo.Camelideos = melox.faixasPorGrupo.Cervideos;
    melox.faixasPorGrupo.Ratitas = {
      opcoes: [0.5, 1.0], via: "IM (coxa!) ou VO q12–24h", badge: "🟢 AINE em Ratitas (IM na coxa!)", status: "seguro",
      fontes: [["Carpenter 6ª Ed. & Cubas Cap. 18", "Ratites: 0.5–1.0 mg/kg IM (thigh), PO q12–24h.", "📖 Conferido na Fonte"]]
    };
    melox.faixasPorGrupo.Anfibios = {
      opcoes: [0.1, 0.2], via: "IM, ICe ou VO a cada 24h (suspender em hidropsia/doença renal!)", badge: "🟡 AINE em Anfíbios (0,1–0,2 mg/kg)", status: "alerta",
      fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., Cap. Amphibians", "Amphibians: 0.1–0.2 mg/kg IM, ICe, PO q24h.", "📖 Conferido na Fonte"]]
    };
  }

  const omep = byId("Omeprazol");
  if (omep) {
    omep.faixasPorGrupo.Equideos = {
      opcoes: [2.0, 4.0], via: "Tratamento EGUS (Úlcera Gástrica Equina): 4 mg/kg VO SID (pasta tamponada) | Prevenção: 1–2 mg/kg SID", badge: "⭐ 1ª Escolha na Úlcera Gástrica Equina (4 mg/kg SID)", status: "seguro",
      fontes: [["Equine Medicine Secrets & Consenso ECEIM / Plumb's 10ª Ed.", "Equine Gastric Ulcer Syndrome (EGUS): 4 mg/kg PO q24h for 28 days; prevention 1–2 mg/kg q24h.", "📖 Conferido na Fonte"]]
    };
  }

  const itra = byId("Itraconazol");
  if (itra) {
    itra.faixasPorGrupo.Sphenisciformes = {
      opcoes: [10, 15], via: "VO (dentro do peixe) q12–24h — Profilaxia e Tratamento da Aspergilose em Pinguins!", badge: "⭐ ESSENCIAL EM PINGUINS (Aspergilose!)", status: "seguro",
      fontes: [["Cubas Cap. 22 & Carpenter 6ª Ed., p. 258", "Penguins: 10–15 mg/kg PO q12–24h for treatment/prophylaxis of Aspergillosis.", "📖 Conferido na Fonte"]]
    };
    itra.faixasPorGrupo.Anfibios = {
      opcoes: [5, 10], via: "Banho terapêutico 0,01% (100 mg/L em água declorada) por 5 min/dia × 10 dias (Quitridiomicose — Bd) ou 5 mg/kg VO", badge: "⭐ 1ª Escolha na Quitridiomicose (Banho 0,01%!)", status: "seguro",
      fontes: [["Cubas Cap. 12 & Carpenter 6ª Ed., Cap. Amphibians", "Chytridiomycosis (Batrachochytrium dendrobatidis): 0.01% itraconazole bath 5 min q24h for 10 days.", "📖 Conferido na Fonte"]]
    };
  }

  const iverm = byId("Ivermectina");
  if (iverm) {
    iverm.faixasPorGrupo.Crocodilianos = {
      opcoes: [0], via: "⛔ EVITAR EM CROCODILIANOS (relatos de neurotoxicidade/paresia — usar Fenbendazol 50 mg/kg!)", badge: "⛔ Evitar em Crocodylia", status: "proibido",
      fontes: [["Carpenter's Exotic Animal Formulary — 6ª Ed., p. 117", "Avoid ivermectin in crocodilians due to neurologic toxicity; use fenbendazole.", "📖 Conferido na Fonte"]]
    };
  }

  const penta = byId("Pentabiotico");
  if (penta) {
    penta.faixasPorGrupo.Equideos = {
      opcoes: [22000, 30000, 40000], via: "IM PROFUNDA (dividir máx 15–20 mL por ponto; ASPIRAR ANTES — PROIBIDO IV!) q48–72h", badge: "⭐ 1ª Escolha de Campo em Equídeos/Ungulados (IM Profunda!)", status: "seguro",
      fontes: [["Spinosa 6ª Ed., p. 466 & Equine Medicine Secrets", "Equids & Ungulates: 22,000–40,000 IU/kg deep IM q48–72h. Strictly contraindicated IV.", "📖 Conferido na Fonte"]]
    };
    penta.faixasPorGrupo.Cervideos = penta.faixasPorGrupo.Equideos;
    penta.faixasPorGrupo.Tapiridae = penta.faixasPorGrupo.Equideos;
    penta.faixasPorGrupo.BovideosSilv = penta.faixasPorGrupo.Equideos;
    penta.faixasPorGrupo.Camelideos = penta.faixasPorGrupo.Equideos;
  }
})();

// 8. Sincronização Automática Universal: garante f.dosesPorId[t.id] E f.dosesPadrao[tIdx] 100% alinhados (38 táxons!)
(function sincronizarMatrizDosesPorId() {
  FARMACOS_DB.forEach(f => {
    const mapa = {};
    // Preserva as 21 doses originais mapeadas pelo ID de cada táxon (0..20)
    for (let i = 0; i < 21 && i < TAXONS_DB.length; i++) {
      const tid = TAXONS_DB[i].id;
      mapa[tid] = f.dosesPadrao[i] !== undefined ? f.dosesPadrao[i] : f.dosesPadrao[0];
    }
    // Mescla as 17 novas doses nominais
    const extras = NOVAS_DOSES_POR_FARMACO[f.id] || {};
    for (let i = 21; i < TAXONS_DB.length; i++) {
      const tid = TAXONS_DB[i].id;
      mapa[tid] = extras[tid] !== undefined ? extras[tid] : 0;
    }
    f.dosesPorId = mapa;
    // Reconstrói dosesPadrao com comprimento exato = TAXONS_DB.length (38)
    f.dosesPadrao = TAXONS_DB.map(t => mapa[t.id]);
  });
})();
// ============================================================================
// EXPANSÃO TAXONÔMICA v1.7 (BLOCO D — +6 TÁXONS: 38 -> 44 GRUPOS TAXONÔMICOS)
// Cuculiformes, Chiroptera, Caprimulgiformes, Charadriiformes, Picidae, Diprotodontia
// ============================================================================

TAXONS_DB.push(
  // 38: Cuculiformes
  {
    id: "Cuculiformes", grupo: "Aves — Cuculiformes", nome: "🐦 Cuculiformes (Anu-preto, Anu-branco, Anu-coroca, Alma-de-gato)",
    tMin: 39.5, tBasalMin: 40.0, tMax: 42.0, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 15,
    tuboSangue: "Microtubo com Heparina de Lítio (Veia Jugular Direita ou Metatarsal Medial)",
    vias: "VO (sonda lenta — SEM inglúvio verdadeiro!), SC (prega inguinal), IM (peitoral c/ Diluição 1:10 se < 150 g), IV (jugular direita, metatarsal medial), IO (ulna distal / tibiotarso)",
    proibido: "⛔ Corticoides (aspergilose!), Pentabiótico, tubo traqueal com cuff e acesso IO em úmero/fêmur. ⚠️ Doses são EXTRAPOLADAS de aves não-passeriformes (Carpenter 6ª ed.): evitar AINEs não-seletivos e usar Fenbendazol apenas com coproparasitológico positivo e sem superdosagem!",
    regraOuro: "1) NÃO possuem inglúvio (papo) verdadeiro (máx 10–15 mL/kg na gavagem lenta após normotermia!); 2) Aves altamente gregárias que conservam calor em grupo — isoladas na internação entram em hipotermia rapidamente (manter aquecimento estável 28–32 °C!); 3) Dieta insetívora/carnívora oportunista.",
    subespecies: [
      { nome: "Anu-preto (Crotophaga ani — 80 a 130 g)", peso: 105, unid: "g", alerta: "Termorregulação social: risco alto de hipotermia quando internado sozinho; manter aquecimento estável e dieta insetívora/hiperproteica." },
      { nome: "Anu-branco (Guira guira — 110 a 170 g)", peso: 140, unid: "g", alerta: "Não possui inglúvio verdadeiro; gavagem lenta máx 10–15 mL/kg." },
      { nome: "Anu-coroca (Crotophaga major — 140 a 200 g)", peso: 165, unid: "g", alerta: "" },
      { nome: "Alma-de-gato (Piaya cayana — 95 a 130 g)", peso: 110, unid: "g", alerta: "Cauda muito longa e frágil — evitar gaiolas estreitas de grade (risco de quebra de retrizes)." }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ Manejo, Radiografia e Curativos (Extrapolada Aves)", drogas: [["Midazolam", 1.5], ["Butorfanol", 1.5]], via: "IM (peitoral — Diluição 1:10) ou Intranasal", obs: "Reversor: Flumazenil 0,05 mg/kg IM (Carpenter 6ª ed.)." },
      { nome: "Contenção Química Curta", drogas: [["Cetamina", 12.0], ["Midazolam", 1.5]], via: "IM", obs: "Manter aquecimento controlado na recuperação." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (20 mg/kg) + Midazolam (2 mg/kg) IM peitoral", 20, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV/IO) ou Isoflurano em máscara até apneia e arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV/IO) somente após plano anestésico profundo confirmado.", 1.0]
    }
  },
  // 39: Chiroptera
  {
    id: "Chiroptera", grupo: "Mamíferos — Chiroptera", nome: "🦇 Morcegos (Frugívoros, Insetívoros e Hematófagos — Chiroptera)",
    tMin: 20.0, tBasalMin: 35.5, tMax: 39.5, fluidoManut: 80, bolusChoque: 10, fatorK: 70, gavMax: 15,
    tuboSangue: "Capilar Heparinizado / Microtubo Heparina de Lítio (Veia Propatagial/Cefálica ou Uropatagial — evitar coleta em morcegos < 20 g!)",
    vias: "SC (interescapular — 1ª escolha p/ fluidos!), VO (seringa de insulina sem agulha), IM (peitoral/coxa em Diluição 1:10 ou 1:100), IV (propatagial/uropatagial)",
    proibido: "⛔ PROIBIDO MANUSEIO SEM LUVAS DE COURO GROSSAS / EPI DE RAIVA (Vacinação pré-exposição obrigatória!). ⛔ Proibido fármacos concentrados puros (microfauna: usar Diluição 1:10 ou 1:100!), Pentabiótico e suturas sob tensão no patágio (necrose da membrana alar!).",
    regraOuro: "Cubas (Cap. Chiroptera) / Carpenter 6ª ed.: 1) HETEROTERMIA / TORPOR FISIOLÓGICO: no frio/repouso a temperatura cai para 20–28 °C (não confundir com óbito; aquecer gradualmente a 30–32 °C ambiental!); 2) HIPOGLICEMIA FULMINANTE: oferecer gotas de água glicosada/suco diluído imediatamente em frugívoros; 3) Envolver o corpo em tecido macio durante o exame.",
    subespecies: [
      { nome: "Morcego-das-frutas (Artibeus lituratus — 55 a 80 g)", peso: 68, unid: "g", alerta: "🚨 EPI RAIVA OBRIGATÓRIO: Oferecer néctar/suco diluído na triagem (evita hipoglicemia) e usar Diluição 1:10." },
      { nome: "Morcego-frugívoro Pequeno (Carollia / Sturnira — 15 a 30 g)", peso: 22, unid: "g", alerta: "🚨 MICROFAUNA (< 30 g): Usar obrigatoriamente Diluição 1:100 p/ injetáveis; coleta de sangue contraindicada pelo volume mínimo." },
      { nome: "Morcego-insetívoro Urbano (Molossus / Tadarida / Myotis — 10 a 25 g)", peso: 16, unid: "g", alerta: "🚨 MICROFAUNA (< 25 g) + RAIVA: Espécie urbana frequente em quedas; avaliar fratura de rádio/metacarpos e rasgo de patágio." },
      { nome: "Morcego-hematófago (Desmodus rotundus — 25 a 45 g)", peso: 35, unid: "g", alerta: "🚨 ALTO RISCO EPIDEMIOLÓGICO DE RAIVA: Seguir rigorosamente protocolo sanitário oficial / vigilância epidemiológica e EPI reforçado." }
    ],
    sedacao: [
      { nome: "Sedação Leve / Analgesia (Preferir Isoflurano em Máscara!)", drogas: [["Midazolam", 0.5], ["Butorfanol", 0.5]], via: "SC ou IM (Diluição 1:10 / 1:100)", obs: "Carpenter 6ª ed. Em procedimentos de asa/patágio, Isoflurano em máscara oferece recuperação muito mais rápida e segura." }
    ],
    eutanasia: {
      etapa1: ["Indução em câmara de Isoflurano ou Cetamina (25 mg/kg) + Midazolam (1 mg/kg) SC/IM (Diluição 1:10!)", 25, 100, 1.0, 5],
      etapa2: ["Isoflurano em alta concentração ou Propofol (10 mg/kg IV/IP) até apneia e arreflexia profunda", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV/IC) somente após confirmação absoluta de plano profundo.", 1.0]
    }
  },
  // 40: Caprimulgiformes
  {
    id: "Caprimulgiformes", grupo: "Aves — Caprimulgiformes", nome: "🌙 Bacuraus, Curiangos e Urutaus (Caprimulgiformes)",
    tMin: 28.0, tBasalMin: 39.5, tMax: 41.5, fluidoManut: 50, bolusChoque: 10, fatorK: 78, gavMax: 12,
    tuboSangue: "Microtubo com Heparina de Lítio (Veia Jugular Direita ou Basílica — metatarsal muito curta/fina)",
    vias: "SC (prega inguinal), IM (peitoral c/ Diluição 1:10), VO (EXTREMO CUIDADO com mandíbula frágil — sem papo!), IV (jugular direita), IO (ulna distal)",
    proibido: "⛔ PROIBIDO forçar abertura do bico pela ponta (mandíbula laminar extremamente fina e frágil — fratura iatrogênica imediata!). ⛔ Proibido Corticoides, Pentabiótico, tubo traqueal com cuff e gaiolas de grade rígida (destroem rêmiges!).",
    regraOuro: "Altíssima casuística de atropelamento noturno (TCE + trauma ocular!). 1) NÃO possuem inglúvio verdadeiro (gavagem máx 10–12 mL/kg); 2) Podem entrar em TORPOR FACULTATIVO (< 30 °C) no frio/jejum; 3) Insetívoros aéreos estritos: abrir o bico segurando suavemente pelas comissuras laterais e alojar em recinto acolchoado com paredes lisas/tecido.",
    subespecies: [
      { nome: "Bacurau / Curiango (Nyctidromus albicollis — 45 a 75 g)", peso: 58, unid: "g", alerta: "🚨 BICO LAMINAR FRÁGIL: Nunca puxar pela ponta! Usar Diluição 1:10 e avaliar fundo de olho/TCE." },
      { nome: "Bacurau-tesoura / Pequeno (Hydropsalis / Chordeiles — 35 a 60 g)", peso: 45, unid: "g", alerta: "Risco extremo de lesão de penas em grades; manter em caixa acolchoada escura e silenciosa." },
      { nome: "Urutau / Mãe-da-lua (Nyctibius griseus — 140 a 200 g)", peso: 170, unid: "g", alerta: "Fornecer tronco/poleiro grosso estável na reabilitação; alimentação manual delicada com insetos." }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ Exame Oftálmico, RX e Manejo", drogas: [["Midazolam", 1.5], ["Butorfanol", 1.5]], via: "IM (Diluição 1:10) ou Intranasal", obs: "Reduz estresse e risco de trauma de asa durante radiografias (Carpenter 6ª ed.)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (20 mg/kg) + Midazolam (2 mg/kg) IM peitoral", 20, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV/IO) ou Isoflurano até apneia e arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV/IO) após plano profundo.", 1.0]
    }
  },
  // 41: Charadriiformes
  {
    id: "Charadriiformes", grupo: "Aves — Charadriiformes", nome: "🌊 Quero-quero, Gaivotas, Trinta-réis e Maçaricos (Charadriiformes)",
    tMin: 39.5, tBasalMin: 40.0, tMax: 42.0, fluidoManut: 55, bolusChoque: 10, fatorK: 78, gavMax: 20,
    tuboSangue: "Microtubo com Heparina de Lítio (Veia Metatarsal Medial ou Basílica)",
    vias: "IV (metatarsal medial = excelente!, basílica, jugular direita), IO (ulna distal / tibiotarso), IM (peitoral), SC, VO",
    proibido: "⛔ Corticoides (aspergilose em aves costeiras!), Pentabiótico, tubo com cuff inflado e piso rígido sem acolchoamento (pododermatite rápida!).",
    regraOuro: "Cubas / Carpenter 6ª ed.: 1) QUERO-QUERO (Vanellus chilensis): possui ESPORÃO ÓSSEO CARPAL afiado nas asas (proteger mãos na contenção!) e pernas longas com alto risco de miopatia de captura; 2) GAIVOTAS E TRINTA-RÉIS: investigar botulismo, ingestão de anzol/chumbo (RX!), aspergilose e deficiência de tiamina (Vit. B1) em dieta com peixe congelado.",
    subespecies: [
      { nome: "Quero-quero (Vanellus chilensis — 250 a 360 g)", peso: 300, unid: "g", alerta: "🚨 ESPORÃO CARPAL AFIADO nas asas! Alto risco de fratura de tibiotarso e miopatia de captura." },
      { nome: "Gaivotão / Gaivota (Larus dominicanus / Chroicocephalus — 650 g a 1.1 kg)", peso: 850, unid: "g", alerta: "Investigar botulismo ('pescoço mole'), anzóis/linhas de pesca e aspergilose; suplementar Vit. B1 em dieta com peixe descongelado." },
      { nome: "Trinta-réis (Thalasseus / Sterna — 120 a 300 g)", peso: 200, unid: "g", alerta: "Aves marinhas pelágicas: proteger impermeabilização das penas e suplementar tiamina." },
      { nome: "Batuíra / Maçarico (Charadrius / Calidris — 35 a 90 g)", peso: 55, unid: "g", alerta: "Microfauna: usar Diluição 1:10; piso macio para prevenir pododermatite." }
    ],
    sedacao: [
      { nome: "Sedação Antiestresse p/ RX, Retirada de Anzol e Curativos", drogas: [["Midazolam", 1.5], ["Butorfanol", 1.5]], via: "IM ou IV (metatarsal medial)", obs: "Prevenção eficaz de miopatia de captura (Carpenter 6ª ed.)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1.5 mg/kg) IM", 15, 100, 1.5, 5],
      etapa2: ["Propofol (10 mg/kg IV na metatarsal medial) até apneia e arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  },
  // 42: Picidae
  {
    id: "Picidae", grupo: "Aves — Piciformes (Picidae)", nome: "🪵 Pica-paus (Pica-pau-do-campo, Birro, Pica-pau-verde)",
    tMin: 40.0, tBasalMin: 40.5, tMax: 42.0, fluidoManut: 55, bolusChoque: 10, fatorK: 78, gavMax: 15,
    tuboSangue: "Microtubo com Heparina de Lítio (Veia Jugular Direita ou Basílica)",
    vias: "SC (prega inguinal), IM (peitoral c/ Diluição 1:10), VO (SEM inglúvio verdadeiro!), IV (jugular direita), IO (ulna distal)",
    proibido: "⛔ Corticoides, Pentabiótico, tubo traqueal com cuff e recinto sem superfície/tronco vertical (pés zigodáctilos e cauda rígida precisam de apoio vertical!).",
    regraOuro: "Alta casuística de colisão em vidraças (TCE!). 1) NÃO possuem inglúvio verdadeiro (gavagem máx 12–15 mL/kg); 2) Aparelho hioide e língua protrátil longa envolvem o crânio (cuidado ao examinar/sondar cavidade oral e avaliar trauma craniano!); 3) Diferente dos Tucanos (Ramphastidae), NÃO têm predisposição severa à hemocromatose; dieta insetívora.",
    subespecies: [
      { nome: "Pica-pau-do-campo (Colaptes campestris — 140 a 190 g)", peso: 160, unid: "g", alerta: "Muito comum em trauma por colisão/atropelamento; bico perfurante (conter cabeça com segurança)." },
      { nome: "Pica-pau-branco / Birro (Melanerpes candidus — 100 a 135 g)", peso: 115, unid: "g", alerta: "Onívoro/insetívoro e frugívoro; não possui papo verdadeiro." },
      { nome: "Pica-pau-pequeno / Picapauzinho (Veniliornis / Picumnus — 12 a 55 g)", peso: 35, unid: "g", alerta: "Microfauna: usar Diluição 1:10 ou 1:100 obrigatória." }
    ],
    sedacao: [
      { nome: "Sedação Segura p/ Exame, RX e Manejo", drogas: [["Midazolam", 1.5], ["Butorfanol", 1.5]], via: "IM (peitoral) ou Intranasal", obs: "Carpenter 6ª ed. Associar Cetamina (10–12 mg/kg IM) ou Isoflurano para procedimentos dolorosos." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (20 mg/kg) + Midazolam (2 mg/kg) IM", 20, 100, 2.0, 5],
      etapa2: ["Propofol (10 mg/kg IV/IO) ou Isoflurano até arreflexia", 10, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV/IO) após plano profundo.", 1.0]
    }
  },
  // 43: Diprotodontia
  {
    id: "Diprotodontia", grupo: "Marsupiais — Diprotodontia (Exóticos)", nome: "🦘 Petauro-do-açúcar (Sugar Glider) & Canguru / Wallaby",
    tMin: 34.0, tBasalMin: 35.5, tMax: 37.2, fluidoManut: 60, bolusChoque: 10, fatorK: 49, gavMax: 20,
    tuboSangue: "Microtubo EDTA + Heparina (Petauro: Jugular/Cava Cranial sob Isoflurano; Canguru: Coccígea Lateral ou Safena)",
    vias: "SC (interescapular — atenção ao patágio no Petauro!), VO, IM (quadríceps — Diluição 1:10 no Petauro!), IV (jugular/coccígea lateral), IO (tíbia/fêmur)",
    proibido: "⛔ AINEs prolongados sem gastroproteção (risco de úlcera gástrica marsupial), superaquecimento (> 37,5 °C!) e Pentabiótico em microfauna (< 150 g). Em Petauros: PROIBIDO fármacos concentrados puros e jejum prolongado.",
    regraOuro: "Marsupiais basoendotérmicos (K=49, T normal 35,5–37,0 °C — Carpenter 6ª ed.): 1) PETAURO-DO-AÇÚCAR: paresia de membros pélvicos quase sempre é Osteodistrofia Nutricional (DOM / hipocalcemia por dieta só de frutas!) — repor Cálcio + Vit. D3 + analgesia; alto risco de automutilação por dor/estresse (Gabapentina + colar adaptado); 2) CANGURU/WALLABY: risco elevado de Lumpy Jaw (Fusobacterium necrophorum → Clindamicina/Metronidazol) e Miopatia de Captura!",
    subespecies: [
      { nome: "Petauro-do-açúcar / Sugar Glider (Petaurus breviceps — 90 a 150 g)", peso: 115, unid: "g", alerta: "🚨 PETAURO: Investigar hipocalcemia/DOM em paresia pélvica; alto risco de automutilação sob dor/estresse; usar Diluição 1:10." },
      { nome: "Wallaby / Canguru-de-Bennett (Notamacropus rufogriseus — 12 a 22 kg)", peso: 16.0, unid: "kg", alerta: "Risco elevado de Miopatia de Captura e Lumpy Jaw (osteomielite mandibular por anaeróbios → Clindamicina/Metronidazol)." },
      { nome: "Canguru-vermelho / Cinza (Osphranter / Macropus — 30 a 75 kg)", peso: 45.0, unid: "kg", alerta: "🚨 SEGURANÇA: Chute pélvico potente! Conter com dardo IM (West 3ª ed.) e monitorar temperatura retal." }
    ],
    sedacao: [
      { nome: "Sedação Analgésica Segura (Petauro: preferir Isoflurano em máscara!)", drogas: [["Midazolam", 0.5], ["Butorfanol", 0.4]], via: "IM ou SC", obs: "Carpenter 6ª ed. Em Wallaby/Canguru, associar Cetamina (5–10 mg/kg IM) conforme porte (West 3ª ed.)." }
    ],
    eutanasia: {
      etapa1: ["Cetamina (15 mg/kg) + Midazolam (1 mg/kg) IM", 15, 100, 1.0, 5],
      etapa2: ["Propofol (8 mg/kg IV na coccígea/jugular) até apneia e arreflexia", 8, 10],
      etapa3: ["KCl 19,1% (1 mL/kg IV) após plano profundo.", 1.0]
    }
  }
);

// Referências Laboratoriais (LAB_REF_DB) para os 6 novos táxons
Object.assign(LAB_REF_DB, {
  Cuculiformes:     { ht:[40,54], ppt:[3.0,5.0], glic:[200,380], renalNome:"Ác. Úrico (mg/dL)", renal:[3.0,13.0], hepNome:"AST (U/L)", hep:[100,320], nota:"Referência extrapolada de aves não-passeriformes insetívoras/carnívoras (Campbell / Carpenter); uricotélicos — avaliar AST + CK em conjunto." },
  Chiroptera:       { ht:[42,60], ppt:[5.0,7.8], glic:[70,180],  renalNome:"Creatinina (mg/dL)", renal:[0.3,1.2],  hepNome:"ALT (U/L)", hep:[15,110],  nota:"Morcegos (Cubas / Campbell): hematócrito fisiologicamente elevado (42–60%). Evitar coleta de sangue se peso < 20 g." },
  Caprimulgiformes: { ht:[40,54], ppt:[2.8,4.8], glic:[200,380], renalNome:"Ác. Úrico (mg/dL)", renal:[3.0,13.0], hepNome:"AST (U/L)", hep:[100,320], nota:"Referência extrapolada de aves noturnas insetívoras (Campbell); uricotélicos — priorizar estabilização de TCE antes da coleta." },
  Charadriiformes:  { ht:[38,54], ppt:[3.0,5.2], glic:[200,380], renalNome:"Ác. Úrico (mg/dL)", renal:[3.0,14.0], hepNome:"AST (U/L)", hep:[110,340], nota:"Charadriiformes (Campbell): avaliar AST + CK na suspeita de miopatia de captura em quero-queros e eletrólitos em aves costeiras." },
  Picidae:          { ht:[42,56], ppt:[3.0,5.0], glic:[220,400], renalNome:"Ác. Úrico (mg/dL)", renal:[3.0,13.0], hepNome:"AST (U/L)", hep:[110,330], nota:"Pica-paus (Campbell): uricotélicos; coleta preferencial na jugular direita com microtubo heparinizado." },
  Diprotodontia:    { ht:[40,56], ppt:[5.2,7.5], glic:[80,180],  renalNome:"Creatinina (mg/dL)", renal:[0.3,1.2],  hepNome:"ALT (U/L)", hep:[20,110],  nota:"Marsupiais Diprotodontia (Carpenter / Campbell): em petauros com paresia pélvica, avaliar obrigatoriamente Cálcio e relação Ca:P (DOM)!" }
});

// Particularidades XABCDE para os 6 novos táxons
(function expandirXabcdeBlocoD() {
  const etapas = PROTOCOLOS_MESTRES?.xabcde?.etapas || [];
  const porLetra = l => etapas.find(e => e.letra === l)?.porTaxon;

  const pA = porLetra("A");
  if (pA) {
    pA.Caprimulgiformes = "🚨 BICO LAMINAR EXTREMAMENTE FRÁGIL: Nunca forçar abertura pela ponta da mandíbula (abrir apenas pelas comissuras laterais)! Tubo sem cuff.";
  }
  const pE = porLetra("E");
  if (pE) {
    pE.Cuculiformes = "Aves gregárias (anus): isoladas perdem calor rapidamente — manter aquecimento estável (28–32 °C) em caixa escura e silenciosa.";
    pE.Chiroptera = "🚨 BIOSSEGURANÇA RAIVA (luvas de couro obrigatórias!) + TORPOR FISIOLÓGICO (20–28 °C): reaquecer gradualmente e ofertar glicose/suco diluído em frugívoros.";
    pE.Caprimulgiformes = "Diferenciar torpor facultativo (< 30 °C) de hipotermia grave; alojar em recinto acolchoado sem grades rígidas.";
    pE.Charadriiformes = "Atenção ao esporão ósseo carpal nas asas do quero-quero e ao alto risco de miopatia de captura em membros longos.";
    pE.Diprotodontia = "Basoendotérmicos (35,5–37,0 °C): não superaquecer acima de 37,5 °C; inspecionar marsúpio e patágio (petauros).";
  }
})();

// Sincronização Nominal dos 38 Fármacos com os 6 Novos Táxons (Total: 44 Táxons!)
(function sincronizarDosesBlocoD() {
  const DOSES_BLOCO_D = {
    "Amoxicilina+Clav":    { Cuculiformes:125,  Chiroptera:15,   Caprimulgiformes:125, Charadriiformes:125, Picidae:125,  Diprotodontia:15   },
    "Clindamicina":        { Cuculiformes:100,  Chiroptera:11,   Caprimulgiformes:100, Charadriiformes:100, Picidae:100,  Diprotodontia:11   },
    "Enrofloxacina":       { Cuculiformes:15,   Chiroptera:5,    Caprimulgiformes:15,  Charadriiformes:15,  Picidae:15,   Diprotodontia:5    },
    "Marbofloxacina":      { Cuculiformes:10,   Chiroptera:4,    Caprimulgiformes:10,  Charadriiformes:10,  Picidae:10,   Diprotodontia:4    },
    "Ceftazidima":         { Cuculiformes:75,   Chiroptera:25,   Caprimulgiformes:75,  Charadriiformes:75,  Picidae:75,   Diprotodontia:25   },
    "Doxiciclina":         { Cuculiformes:35,   Chiroptera:5,    Caprimulgiformes:35,  Charadriiformes:35,  Picidae:35,   Diprotodontia:5    },
    "Metronidazol":        { Cuculiformes:25,   Chiroptera:15,   Caprimulgiformes:25,  Charadriiformes:25,  Picidae:25,   Diprotodontia:15   },
    "Dipirona":            { Cuculiformes:25,   Chiroptera:25,   Caprimulgiformes:25,  Charadriiformes:25,  Picidae:25,   Diprotodontia:25   },
    "Meloxicam":           { Cuculiformes:1.0,  Chiroptera:0.2,  Caprimulgiformes:1.0, Charadriiformes:1.0, Picidae:1.0,  Diprotodontia:0.1  },
    "Tramadol":            { Cuculiformes:10,   Chiroptera:2,    Caprimulgiformes:10,  Charadriiformes:10,  Picidae:10,   Diprotodontia:2    },
    "Gabapentina":         { Cuculiformes:15,   Chiroptera:10,   Caprimulgiformes:15,  Charadriiformes:15,  Picidae:15,   Diprotodontia:10   },
    "Butorfanol":          { Cuculiformes:1.5,  Chiroptera:0.5,  Caprimulgiformes:1.5, Charadriiformes:1.5, Picidae:1.5,  Diprotodontia:0.4  },
    "Metadona":            { Cuculiformes:1.0,  Chiroptera:0.2,  Caprimulgiformes:1.0, Charadriiformes:1.0, Picidae:1.0,  Diprotodontia:0.2  },
    "Midazolam":           { Cuculiformes:1.5,  Chiroptera:0.5,  Caprimulgiformes:1.5, Charadriiformes:1.5, Picidae:1.5,  Diprotodontia:0.5  },
    "Cetamina":            { Cuculiformes:15,   Chiroptera:10,   Caprimulgiformes:15,  Charadriiformes:15,  Picidae:15,   Diprotodontia:10   },
    "Maropitant":          { Cuculiformes:1.0,  Chiroptera:1.0,  Caprimulgiformes:1.0, Charadriiformes:1.0, Picidae:1.0,  Diprotodontia:1.0  },
    "Furosemida":          { Cuculiformes:0.2,  Chiroptera:2.0,  Caprimulgiformes:0.2, Charadriiformes:0.2, Picidae:0.2,  Diprotodontia:2.0  },
    "Nitenpiram":          { Cuculiformes:1.0,  Chiroptera:1.0,  Caprimulgiformes:1.0, Charadriiformes:1.0, Picidae:1.0,  Diprotodontia:1.0  },
    "Manitol 20%":         { Cuculiformes:500,  Chiroptera:500,  Caprimulgiformes:500, Charadriiformes:500, Picidae:500,  Diprotodontia:500  },
    "Vitamina K1":         { Cuculiformes:2.5,  Chiroptera:2.0,  Caprimulgiformes:2.5, Charadriiformes:2.5, Picidae:2.5,  Diprotodontia:2.0  },
    "Carprofeno":          { Cuculiformes:2.0,  Chiroptera:2.0,  Caprimulgiformes:2.0, Charadriiformes:2.0, Picidae:2.0,  Diprotodontia:2.0  },
    "Robenacoxibe":        { Cuculiformes:0,    Chiroptera:1.0,  Caprimulgiformes:0,   Charadriiformes:0,   Picidae:0,    Diprotodontia:1.0  },
    "Prednisolona":        { Cuculiformes:0,    Chiroptera:0.5,  Caprimulgiformes:0,   Charadriiformes:0,   Picidae:0,    Diprotodontia:0.5  },
    "Dexametasona":        { Cuculiformes:0,    Chiroptera:0.15, Caprimulgiformes:0,   Charadriiformes:0,   Picidae:0,    Diprotodontia:0.15 },
    "Lidocaina 2%":        { Cuculiformes:1.5,  Chiroptera:2.0,  Caprimulgiformes:1.5, Charadriiformes:1.5, Picidae:1.5,  Diprotodontia:2.0  },
    "Bupivacaina 0,5%":    { Cuculiformes:1.0,  Chiroptera:1.0,  Caprimulgiformes:1.0, Charadriiformes:1.0, Picidae:1.0,  Diprotodontia:1.0  },
    "Ondansetrona":        { Cuculiformes:0.5,  Chiroptera:0.5,  Caprimulgiformes:0.5, Charadriiformes:0.5, Picidae:0.5,  Diprotodontia:0.5  },
    "Metoclopramida":      { Cuculiformes:0.5,  Chiroptera:0.3,  Caprimulgiformes:0.5, Charadriiformes:0.5, Picidae:0.5,  Diprotodontia:0.3  },
    "Omeprazol":           { Cuculiformes:1.0,  Chiroptera:1.0,  Caprimulgiformes:1.0, Charadriiformes:1.0, Picidae:1.0,  Diprotodontia:1.0  },
    "Sucralfato":          { Cuculiformes:25,   Chiroptera:25,   Caprimulgiformes:25,  Charadriiformes:25,  Picidae:25,   Diprotodontia:25   },
    "Itraconazol":         { Cuculiformes:10,   Chiroptera:5,    Caprimulgiformes:10,  Charadriiformes:10,  Picidae:10,   Diprotodontia:5    },
    "Alopurinol":          { Cuculiformes:15,   Chiroptera:10,   Caprimulgiformes:15,  Charadriiformes:15,  Picidae:15,   Diprotodontia:10   },
    "Ivermectina":         { Cuculiformes:0.2,  Chiroptera:0.2,  Caprimulgiformes:0.2, Charadriiformes:0.2, Picidae:0.2,  Diprotodontia:0.2  },
    "Fenbendazol":         { Cuculiformes:20,   Chiroptera:25,   Caprimulgiformes:20,  Charadriiformes:20,  Picidae:20,   Diprotodontia:25   },
    "Sulfametoxazol+Trim": { Cuculiformes:30,   Chiroptera:20,   Caprimulgiformes:30,  Charadriiformes:30,  Picidae:30,   Diprotodontia:20   },
    "Cefalexina":          { Cuculiformes:50,   Chiroptera:22,   Caprimulgiformes:50,  Charadriiformes:50,  Picidae:50,   Diprotodontia:22   },
    "Escopolamina":        { Cuculiformes:0,    Chiroptera:0.5,  Caprimulgiformes:0,   Charadriiformes:0,   Picidae:0,    Diprotodontia:0.5  },
    "Pentabiotico":        { Cuculiformes:0,    Chiroptera:0,    Caprimulgiformes:0,   Charadriiformes:0,   Picidae:0,    Diprotodontia:0    }
  };

  FARMACOS_DB.forEach(f => {
    const extras = DOSES_BLOCO_D[f.id] || {};
    if (!f.dosesPorId) f.dosesPorId = {};
    Object.assign(f.dosesPorId, extras);
    f.dosesPadrao = TAXONS_DB.map(t => (f.dosesPorId[t.id] !== undefined ? f.dosesPorId[t.id] : 0));
  });
})();