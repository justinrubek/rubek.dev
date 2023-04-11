import type{ NavItems } from './types'

export const NAV_ITEMS: NavItems = {
    home: {
        path: '/',
        title: 'home'
    },
    contact: {
        path: '/contact',
        title: 'contact'
    },
    about: {
        path: '/about',
        title: 'about'
    },
    posts: {
        path: '/posts',
        title: 'posts'
    },
    docs: {
        path: '/docs',
        title: 'docs'
    },
    tags: {
        path: '/tags',
        title: 'tags'
    },
}

export const SITE = {
    name: 'rubek.dev',
    title: 'rubek.dev',
    description: '',
    url: 'https://rubek.dev',
    githubUrl: 'https://github.com/justinrubek',
    repoUrl: 'https://github.com/justinrubek/rubek.dev',
    listDrafts: true
}

export const PAGE_SIZE = 8
