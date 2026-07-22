import { describe, it, expect } from 'vitest';
import { challenges } from '../data/challenges';
import { PARCIAL_1_CHALLENGES } from '../data/parcial1';
import { PARCIAL_3_CHALLENGES } from '../data/parcial3';
import { EXAMEN_FINAL_CHALLENGES } from '../data/final';

describe('Build Regression — E10', () => {
  describe('E10.3: All exercises have unique IDs', () => {
    it('main challenges have unique ids', () => {
      const ids = challenges.map(c => c.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('parcial1 challenges have unique ids', () => {
      const ids = PARCIAL_1_CHALLENGES.map(c => c.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('parcial3 challenges have unique ids', () => {
      const ids = PARCIAL_3_CHALLENGES.map(c => c.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('final challenges have unique ids', () => {
      const ids = EXAMEN_FINAL_CHALLENGES.map(c => c.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('no duplicate ids within individual collections', () => {
      const collections = [PARCIAL_1_CHALLENGES, PARCIAL_3_CHALLENGES, EXAMEN_FINAL_CHALLENGES];
      for (const col of collections) {
        const ids = col.map(c => c.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      }
    });
  });

  describe('E10.3: All exercises have required fields', () => {
    it('every challenge has id, instruction, hint, validationType', () => {
      const allChallenges = [...challenges, ...PARCIAL_1_CHALLENGES, ...PARCIAL_3_CHALLENGES, ...EXAMEN_FINAL_CHALLENGES];
      for (const ch of allChallenges) {
        expect(ch.id, `Missing id in challenge`).toBeTruthy();
        expect(ch.instruction, `Missing instruction in ${ch.id}`).toBeTruthy();
        expect(ch.hint, `Missing hint in ${ch.id}`).toBeTruthy();
        expect(ch.validationType, `Missing validationType in ${ch.id}`).toBeTruthy();
        expect(ch.solutionHint, `Missing solutionHint in ${ch.id}`).toBeDefined();
      }
    });

    it('state challenges have validateState', () => {
      const allChallenges = [...challenges, ...PARCIAL_1_CHALLENGES, ...PARCIAL_3_CHALLENGES, ...EXAMEN_FINAL_CHALLENGES];
      const stateChallenges = allChallenges.filter(c => c.validationType === 'state' || c.validationType === 'both');
      for (const ch of stateChallenges) {
        expect(typeof ch.validateState, `Missing validateState in ${ch.id}`).toBe('function');
      }
    });

    it('command challenges have expectedCommandRegex or commands', () => {
      const allChallenges = [...challenges, ...PARCIAL_1_CHALLENGES, ...PARCIAL_3_CHALLENGES, ...EXAMEN_FINAL_CHALLENGES];
      const cmdChallenges = allChallenges.filter(c => c.validationType === 'command');
      for (const ch of cmdChallenges) {
        expect(
          ch.expectedCommandRegex || ch.commands.length > 0,
          `Challenge ${ch.id} is command type but has no regex or commands`
        ).toBeTruthy();
      }
    });
  });

  describe('E10.3: Exercise counts', () => {
    it('has reasonable number of challenges', () => {
      expect(challenges.length).toBeGreaterThan(20);
      expect(PARCIAL_1_CHALLENGES.length).toBeGreaterThan(30);
    });
  });
});
