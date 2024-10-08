import { GithubUser } from "./GithubUser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load();
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
    }

    async add(username) {
        try {

            const userExists = this.entries.find(entry => entry.login === username);

            if(userExists) {
                throw new Error('Já adicionado!')
            }

            const user = await GithubUser.search(username);

            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.update();
            this.save();

        } catch (error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => 
            entry.login !== user.login)

        this.entries = filteredEntries;
        this.update();
        this.save();
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('table tbody');

        this.update();
        this.onadd();
    }

    onadd() {
        const addButton = this.root.querySelector('.search button');
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input');

            this.add(value)
        }
    }

    update() {
        this.removeAllTr();

        if (this.entries.length === 0) {
            this.showEmptyMessage();
        } else {
            this.entries.forEach( user => {
                const row = this.createRow();
    
                row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
                row.querySelector('.user img').alt =`Imagem de ${user.name}`;
                row.querySelector('.user a').href = `https://github.com/${user.login}`;
                row.querySelector('.user p').textContent = user.name;
                row.querySelector('.user span').textContent = user.login;
                row.querySelector('.repo').textContent = user.public_repos;
                row.querySelector('.follow').textContent = user.followers;
                row.querySelector('.remove').onclick = () => {
                    const isOk = confirm('Tem certeza que deseja deletar essa linha?');
    
                    if(isOk) {
                        this.delete(user);
                    }
    
                }
    
                this.tbody.append(row);
            })
        }

        
    }

    showEmptyMessage() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="empty"><img src="./assets/Estrela.svg" alt=""><p>Nenhum favorito ainda</p></td>
            <td colspan></td>
            <td></td>
            <td></td>
        `

        this.tbody.append(tr);
    }

    createRow() {

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="user">
                <div class="user-div">
                    <img src="/assets/star.svg" alt="">
                    <a href="https://github.com/LeoMell0" target="_blank">
                        <p>Leo Mello</p>
                        <span>/LeoMell0</span>
                    </a>
                </div>
            </td>
            <td class="repo">123</td>
            <td class="follow">0</td>
            <td class="remove"><button>Remover</button></td>
        
        `

        return tr;
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
        .forEach((tr) => {
            tr.remove();
        });
    }
}

