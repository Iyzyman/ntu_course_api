### SC3040 Advanced Software Engineering Project — _📚 shelvd_

**📚 shelvd** strives to enhance book discovery and foster a vibrant reader community through personalized recommendations, advanced search capabilities, and interactive forums, including virtual book clubs and reader reviews. This web app is the ultimate destination for book lovers seeking to explore new titles and connect with fellow enthusiasts in a dynamic, user-friendly environment.

> REST API behind the social network for book lovers.<br/>
>
> - [Website](https://shelvd.vercel.app)
> - [API](https://shelvd-api.onrender.com/api)
> - [Documentation](https://github.com/mawsters/docs)

<br/>

<p align="center">
  <img src="https://github.com/mawsters/api/assets/65748007/511c5a11-18c9-47a9-97eb-4224dbadbf7e" alt="Project Cover"
    width="960px"
  />
</p>

---

#### 🛠️ Installation and Set Up

- Clone repository

  ```
  git clone git@github.com:crystalcheong/shelvd-api.git
  ```

- Install dependencies
  ```
  bun install
  ```

> [!IMPORTANT]
> Required environment variables
> - Duplicate `.env.example` to create `*.env` files
>    - `.env` — The default file used to store your dev, production, and test variables
>    - `.env.local` — Overrides all environment files except the test file (including the default .env file)


- Preparing Postgres + Drizzle-ORM

  ```
   bun run migrate
   bun run generate
  ```

- Starting the server
  The server will start at `http://localhost:3000` by default
  ```
   bun start:dev
  ```

---

#### 🧰 Languages & Tools

- Languages & Frameworks<br/>
  <img alt="Typescript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" height="25"/>
  <img alt="NestJS" src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" height="25"/>

- Tools, IDE <br/>
  <img alt="Github" src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" height="25"/>
  <img alt="Github Actions" src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" height="25"/>
  <img alt="Render" src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" height="25"/>
  <img alt="Supbase" src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white" height="25"/>


---

#### Contributors ✨

<table>
  <tr>
    <td align="center"><a href="https://github.com/crystalcheong"  target="_blank"><img src="https://avatars.githubusercontent.com/u/65748007?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Crystal Cheong</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/hyunsunryu2020" target="_blank"><img src="https://avatars.githubusercontent.com/u/101242965?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ryu Hyunsun</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/yuhaopro" target="_blank"><img src="https://avatars.githubusercontent.com/u/64051449?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Zhu Yu Hao</b></sub></a><br /></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/NyanMaw" target="_blank"><img src="https://avatars.githubusercontent.com/u/85445638?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nyan Maw Htun</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/Kennethgjw" target="_blank"><img src="https://avatars.githubusercontent.com/u/102150867?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kenneth Goh</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/sufyanjais" target="_blank"><img src="https://avatars.githubusercontent.com/u/37979114?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Muhammad Sufyan</b></sub></a><br /></td>
  <td align="center"><a href="https://github.com/arunezekiel98" target="_blank"><img src="https://avatars.githubusercontent.com/u/124077159?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Arun Ezekiel</b></sub></a><br /></td>
  </tr>
</table>

---

_This repository is submitted as a project work for Nanyang Technological University's [SC3040 - Advanced Software Engineering course](https://www.nanyangmods.com/modules/cz3002-advanced-software-engineering-3-0-au/)._
