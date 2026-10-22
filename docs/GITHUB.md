# Загрузка проекта на GitHub

## Через браузер

1. Распакуй архив. Внутри будет папка `photographer-day`.
2. На GitHub создай новый репозиторий, например `photographer-day`. Не добавляй автоматически README, `.gitignore` или лицензию: README и `.gitignore` уже подготовлены, а лицензию основного проекта можно выбрать отдельно.
3. На странице пустого репозитория выбери **uploading an existing file**. В непустом репозитории это **Add file → Upload files**.
4. Перетащи все файлы и папки **изнутри `photographer-day`**. В корне должны оказаться `README.md`, `package.json`, `dist`, `checks`, `scripts`, `docs` и `.github`. Сам ZIP и внешнюю папку загружать не нужно.
5. Укажи сообщение, например `Initial game version`, и нажми **Commit changes**.
6. Проверь, что существует файл `.github/workflows/pages.yml`. Эта папка важна для автоматической публикации.

Официальная инструкция загрузки: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

## Включить сайт с игрой

1. Открой **Settings → Pages**.
2. В **Build and deployment** выбери **Source: GitHub Actions**.
3. Перейди в **Actions → Check and publish game → Run workflow**, выбери ветку `main` и запусти.
4. Дождись успешного выполнения задач `check-and-package` и `deploy`.
5. Открой адрес из результата `deploy` или из **Settings → Pages**. Именно этот адрес можно отправлять игрокам; адрес репозитория показывает файлы.

В этой конфигурации не нужно выбирать папку `/docs` или копировать туда игру: workflow сам публикует `dist`.

Официальная инструкция: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Через Git

Выполни из папки `photographer-day`:

```sh
git init
git add .
git commit -m "Initial game version"
git branch -M main
```

Создай пустой репозиторий на GitHub, скопируй его HTTPS-адрес и подставь вместо `YOUR_REPOSITORY_URL`:

```sh
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

После этого включи **Settings → Pages → Source: GitHub Actions**. Авторизацию выполняй средствами GitHub/Git; пароли и токены в файлы проекта добавлять не нужно.

## Следующие обновления

При загрузке через браузер заменяй изменённые файлы с сохранением структуры папок. При работе через Git:

```sh
git add .
git commit -m "Update game"
git push
```

Публикация выполняется автоматически после успешных проверок. Если workflow сообщил, что Pages ещё не включён, выбери источник **GitHub Actions** и повтори запуск через **Run workflow**.
