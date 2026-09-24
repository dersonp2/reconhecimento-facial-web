const Storage = {

    KEY: "facial-recognition-people",

    savePeople(people) {

        localStorage.setItem(
            this.KEY,
            JSON.stringify(people)
        );
    },

    getPeople() {

        const data =
            localStorage.getItem(this.KEY);

        if (!data) {
            return [];
        }

        try {

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Erro ao ler pessoas armazenadas:",
                error
            );

            return [];
        }
    },

    addPerson(person) {

        const people =
            this.getPeople();

        people.push(person);

        this.savePeople(people);
    },

    removePerson(id) {

        const people =
            this.getPeople();

        const filteredPeople =
            people.filter(
                person => person.id !== id
            );

        this.savePeople(filteredPeople);
    },

    clear() {

        localStorage.removeItem(
            this.KEY
        );
    }
};