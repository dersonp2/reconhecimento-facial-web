const Person = {

    create(name, embedding) {

        if (!name || !name.trim()) {

            throw new Error(
                "Nome da pessoa é obrigatório."
            );
        }

        if (!embedding || embedding.length === 0) {

            throw new Error(
                "Embedding facial não informado."
            );
        }

        return {

            id: this.generateId(),

            nome: name.trim(),

            embedding: embedding,

            criadoEm:
                new Date().toISOString()
        };
    },

    generateId() {

        return (
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );
    },

    save(name, embedding) {

        const person =
            this.create(
                name,
                embedding
            );

        Storage.addPerson(person);

        return person;
    },

    list() {

        return Storage.getPeople();
    },

    remove(id) {

        Storage.removePerson(id);
    }
};