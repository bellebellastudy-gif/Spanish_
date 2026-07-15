import type { RoleplayScenario } from '../types';

export const SCENARIOS: RoleplayScenario[] = [
  {
    id: 'cafe',
    title: 'Ordering at a café in Oaxaca',
    context: 'You just sat down at a small café known for its pan de yema and want to order breakfast.',
    aiRole: 'the café server, Renata',
    userRole: 'a customer ordering breakfast',
    opener: '¡Buenos días! Bienvenido a Café Luna. ¿Qué le puedo servir hoy?',
  },
  {
    id: 'airport',
    title: 'Airport check-in in Madrid',
    context: 'You are checking in for a flight and need to confirm your seat and baggage.',
    aiRole: 'the airline check-in agent, Diego',
    userRole: 'a traveler checking in for a flight',
    opener: 'Buenas tardes, ¿me permite su pasaporte y el número de su reserva, por favor?',
  },
  {
    id: 'apartment',
    title: 'Meeting a new neighbor',
    context: "You just moved into an apartment in Buenos Aires and run into a neighbor in the hallway.",
    aiRole: 'your neighbor, Marisol',
    userRole: 'someone who just moved in',
    opener: '¡Hola! No te había visto por aquí. ¿Te acabás de mudar al edificio?',
  },
  {
    id: 'interview',
    title: 'Job interview at a design studio',
    context: 'You are interviewing for a junior designer role at a studio in Barcelona.',
    aiRole: 'the hiring manager, Álvaro',
    userRole: 'a candidate interviewing for the job',
    opener: 'Gracias por venir. Cuéntame, ¿qué te atrae de trabajar con nosotros?',
  },
  {
    id: 'clinic',
    title: 'Describing symptoms at a clinic',
    context: 'You have had a sore throat for three days and are seeing a doctor about it.',
    aiRole: 'the doctor, Dra. Fuentes',
    userRole: 'a patient describing symptoms',
    opener: 'Cuénteme, ¿desde cuándo se siente mal y qué síntomas tiene?',
  },
];
