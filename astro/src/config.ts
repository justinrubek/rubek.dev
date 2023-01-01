import type{ NavItems } from './types'

export const NAV_ITEMS: NavItems = {
    home: {
        path: '/',
        title: 'home'
    },
    posts: {
        path: '/posts',
        title: 'posts'
    },
    tags: {
        path: '/tags',
        title: 'tags'
    },
    about: {
        path: '/about',
        title: 'about'
    }
}

export const SITE = {
    name: 'rubek.dev',
    title: 'rubek.dev',
    description: '',
    url: 'https://rubek.dev',
    githubUrl: 'https://github.com/justinrubek',
    listDrafts: true
}

export const PAGE_SIZE = 8
