/**
 * Script de Seed de Lançamento (Production Ready).
 * Define o estado inicial perfeito para um novo usuário do AITeam.
 */

import { getDatabase } from './index.js';
import { nanoid } from 'nanoid';

async function seed() {
  const db = getDatabase();
  console.log('🚀 Preparando ambiente de produção do AITeam...');

  db.pragma('foreign_keys = OFF');
  
  try {
    // 1. LIMPEZA TOTAL (Reset de Fábrica)
    const tables = [
      'agents', 'squads', 'squad_members', 'projects', 'project_squads', 
      'project_agents', 'executions', 'execution_steps', 'memories', 
      'skill_usage_logs', 'error_logs', 'artifacts', 'ratings'
    ];
    
    for (const table of tables) {
      db.prepare(`DELETE FROM ${table}`).run();
    }
    console.log('🧹 Todos os dados de desenvolvimento foram removidos.');

    // 2. RECRUTAMENTO DA ELITE (Os Pilares)
    const eliteSquad = [
      {
        id: nanoid(),
        name: 'Magnus Mastermind',
        role: 'Supreme Architect',
        personality: 'O cérebro supremo e mentor da operação. Visionário e pragmático, orquestra o sistema com precisão cirúrgica.',
        model: 'gemini-2.0-flash',
        tools: JSON.stringify(['list_dir', 'read_file'])
      },
      {
        id: nanoid(),
        name: 'Morgan Marshal',
        role: 'Squad Commander',
        personality: 'A autoridade máxima em comando tático. Garante a execução impecável de cada squad.',
        model: 'gemini-2.0-flash',
        tools: JSON.stringify(['list_dir'])
      },
      {
        id: nanoid(),
        name: 'Pietra Pixel',
        role: 'Product Designer',
        personality: 'Especialista em interfaces premium. Define a estética e a experiência do usuário como prioridade técnica.',
        model: 'gemini-1.5-pro',
        tools: JSON.stringify(['read_file'])
      },
      {
        id: nanoid(),
        name: 'Dante Dev',
        role: 'Lead Developer',
        personality: 'Mestre em engenharia de software. Transforma visões complexas em código robusto e elegante.',
        model: 'gemini-2.0-flash',
        tools: JSON.stringify(['list_dir', 'read_file'])
      },
      {
        id: nanoid(),
        name: 'Sara Search',
        role: 'Data Researcher',
        personality: 'Investigadora analítica. Minera e valida informações para suportar as decisões estratégicas.',
        model: 'gemini-2.0-flash',
        tools: JSON.stringify(['list_dir', 'read_file'])
      },
      {
        id: nanoid(),
        name: 'Merlin Mind',
        role: 'Logic Wizard',
        personality: 'Especialista em lógica profunda e resolução de problemas complexos através de prompts avançados.',
        model: 'gemini-2.0-flash-exp',
        tools: JSON.stringify(['read_file'])
      }
    ];

    const insertAgent = db.prepare(`
      INSERT INTO agents (id, name, role, personality, model, tools)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const agent of eliteSquad) {
      insertAgent.run(agent.id, agent.name, agent.role, agent.personality, agent.model, agent.tools);
    }
    console.log('✅ Elite Squad recrutada e pronta.');

    // 3. SQUAD PADRÃO (O Primeiro Time)
    const mainSquadId = nanoid();
    db.prepare(`
      INSERT INTO squads (id, name, description, pipeline)
      VALUES (?, ?, ?, ?)
    `).run(
      mainSquadId, 
      'High Council', 
      'Conselho Superior de Orquestração. Composto pelos líderes das principais áreas para decisões estratégicas.',
      'Magnus -> Pietra -> Dante'
    );

    // Adicionar membros ao Squad
    const addMember = db.prepare('INSERT INTO squad_members (squad_id, agent_id, position) VALUES (?, ?, ?)');
    addMember.run(mainSquadId, eliteSquad[0].id, 1); // Magnus
    addMember.run(mainSquadId, eliteSquad[2].id, 2); // Pietra
    addMember.run(mainSquadId, eliteSquad[3].id, 3); // Dante
    console.log('✅ Squad "High Council" formado.');

    // 4. PROJETO INICIAL (Genesis)
    const projectId = nanoid();
    db.prepare(`
      INSERT INTO projects (id, name, path, description, default_model)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      projectId,
      'AITeam Genesis',
      './projects/genesis',
      'Projeto inicial de configuração e expansão do sistema AITeam.',
      'gemini-2.0-flash'
    );
    
    // Alocar Squad ao Projeto
    db.prepare('INSERT INTO project_squads (project_id, squad_id) VALUES (?, ?)').run(projectId, mainSquadId);
    console.log('✅ Projeto "AITeam Genesis" inicializado.');

    console.log('\n✨ AMBIENTE PRONTO PARA O USUÁRIO FINAL. Magnus Mastermind aguarda ordens.\n');
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

seed().catch(console.error);
