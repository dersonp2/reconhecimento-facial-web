const Recognition = {

    DISTANCE_THRESHOLD: 0.5,

    compare(embeddingA, embeddingB) {

        if (
            !embeddingA ||
            !embeddingB ||
            embeddingA.length !== embeddingB.length
        ) {
            return Infinity;
        }

        let sum = 0;

        for (let i = 0; i < embeddingA.length; i++) {

            const difference =
                embeddingA[i] - embeddingB[i];

            sum += difference * difference;
        }

        return Math.sqrt(sum);
    },

    findPerson(embedding) {

        const people =
            Person.list();

        if (people.length === 0) {
            return null;
        }

        let bestMatch = null;

        let bestDistance = Infinity;

        for (const person of people) {

            const distance =
                this.compare(
                    embedding,
                    person.embedding
                );

            console.log(
                `Comparação com ${person.nome}:`,
                distance
            );

            if (distance < bestDistance) {

                bestDistance =
                    distance;

                bestMatch =
                    person;
            }
        }

        if (
            bestDistance >
            this.DISTANCE_THRESHOLD
        ) {

            return null;
        }

        return {
            person: bestMatch,
            distance: bestDistance
        };
    }
};