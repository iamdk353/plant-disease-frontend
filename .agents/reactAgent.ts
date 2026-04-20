export type Skill = { name: string; run: (input: any) => Promise<any> };

export class ReactAgent {
  private skills = new Map<string, Skill>();

  register(skill: Skill) {
    this.skills.set(skill.name, skill);
  }

  async handle(request: { task: string; files?: string[] }) {
    // Lightweight decision router: pick a skill based on the request text.
    const task = request.task.toLowerCase();

    if (task.includes("setup typescript") || task.includes("tsconfig")) {
      const s = this.skills.get("typescript-setup");
      if (!s) throw new Error("typescript-setup skill not registered");
      return s.run(request);
    }

    // Default: use implementing-code to perform code changes
    const impl = this.skills.get("implementing-code");
    if (!impl) throw new Error("implementing-code skill not registered");
    return impl.run(request);
  }
}

// Example usage (platform should wire real skill runners):
// const agent = new ReactAgent();
// agent.register({ name: 'implementing-code', run: async (r) => { /* platform skill call */ } });
// agent.handle({ task: 'Add a Diagnose page in TSX' }).then(console.log).catch(console.error);
