import { GithubUser } from "./GithubUser.js"


// classe que vai contar a lógica dos dados
// como os dados serão estruturados

export class Favorites {
    constructor(root){
        this.root = document.querySelector(root)
        this.load()
    }

    checkUserLength() {
        if (this.entries.length === 0) {
            document.querySelector(".empty").style.display = ""
        } else {
            document.querySelector(".empty").style.display = "none"
        }
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []    
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {

        try {

            const userExists = this.entries.find(entry => entry.login === username)

            if(userExists) {
                throw new Error('Usuário já cadastrado !')
            }

            const user = await GithubUser.search(username) 

            if(user.login === undefined) {
                throw new Error('Usuário não encontrado !')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        } catch(error) {
            alert(error.message)
        }
        
    }

    delete(user) {
        // Higher-order functions(map, filter, find, reduce)

        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        
        this.update()
        this.save()
        this.checkUserLength()
    }

}



// classe que vai criar a visualização e eventos do HTML

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            this.add(value)
            
        }
    }


    update() {
        this.removeAlltr()

        this.entries.forEach( user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
               const isOk = confirm('Tem certeza que deseja deletar essa linha ?')  
               
               if(isOk) {
                this.delete(user)
               }
            }

            this.tbody.append(row)
            this.checkUserLength()
        })

    }


    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/fabiobatoni.png" alt="fabiobatoni image">
                <a href="https://github.com/fabiobatoni" target="_blank">
                    <p>Fabio Batoni</p>
                    <span>/fabiobatoni</span>
                </a>
            </td>
            <td class="repositories">40</td>
            <td class="followers">6</td>
            <td>
                <button class="remove">Remove</button>
            </td>
        `

        return tr
    }

    removeAlltr() {
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            })
    }
}