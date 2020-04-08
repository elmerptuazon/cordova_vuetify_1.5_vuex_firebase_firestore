import {DB, STORAGE} from '@/config/firebaseInit';

const articles = {
    namespaced: true,
    state: {
        subscriber: null,
        articles: []
    },
    getters: {
        GET_ARTICLES: state => state.articles,
    },
    mutations: {
        SET_ARTICLES(state, payload) {
            state.articles = payload;
        },
        ADD_ARTICLE(state, payload) {
            state.articles.push(payload);
        },
        UPDATE_ARTICLE(state, payload) {
            const index = state.articles.findIndex((article) => article.id === payload.id);
           
            if(index !== -1) {
                Object.keys(payload.updatedDetails).forEach((key) => {
                    state.articles[index][key] = payload.updatedDetails[key];
                });    
            }
        },
        UPDATE_ARTICLE_BY_FIELD(state, payload) {
            const index = state.articles.findIndex((article) => article.id === payload.id);
           
            if(index !== -1) {
                state.articles[index][payload.key] = payload.value;
            }
        },
    },
    actions: {
        LISTEN_TO_ARTICLES({ state, commit }) {
            console.log('listening to articles');
            commit('SET_ARTICLES', []);

            state.subscriber = DB.collection('articles')
                .orderBy('publishDate', 'desc')
                .onSnapshot((snapshot) => {

                    snapshot.docChanges().forEach(async (change) => {
                            
                        const data = change.doc.data();
                        data.id = change.doc.id;

                        if(change.type === 'added' && !state.articles.length) {
                            console.log('new article arrived!')
                            commit('ADD_ARTICLE', data); //push first article to the list, if list is currently empty
                        
                        } else if(change.type === 'added' && state.articles.length) {
                            //ensure that the latest item is not a duplicate of the last article in the list
                            const lastItem = state.articles[state.articles.length - 1];
                            if(lastItem.id !== data.id) { 
                                console.log('new article arrived!')
                                commit('ADD_ARTICLE', data);
                            }

                        } else if(change.type === 'modified') {
                            console.log('an article was edited');
                            console.log('edit article: ', change);

                            const oldArticle = state.articles.find(article => article.id === data.id);
                            const index = state.articles.findIndex(article => article.id === data.id);
                            console.log('old article: ', oldArticle);

                            if(oldArticle.active && data.active === false) {
                                state.articles.splice(index, 1);
                            
                            } else {
                                commit('UPDATE_ARTICLE', data);
                            }

                            
                        }

                    });

            })
        },

        async GET_ARTICLES({state, commit}) {
            commit('SET_ARTICLES', []);

            const querySnapshot = await DB.collection('articles').orderBy('created_at', 'desc').get();

            const articles = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                data.id = doc.id;
                return data;
            });

            commit('SET_ARTICLES', articles);
        },

        async UPDATE_ARTICLE_BY_FIELD({ state, commit }, payload) {
            const { id, key, value } = payload;

            try {
                await DB.collection('articles').doc(id).update({ [key]: value });

                //if LISTEN_TO_ARTICLES is used for article retrieval, mutations for article is not needed
                if(!state.subscriber) {
                    commit('UPDATE_ARTICLE_BY_FIELD', payload);
                }
                
            } catch(error) {
                throw error;
            }
            
        },

        async UNSUBSCRIBE_TO_ARTICLES({state, commit}) {
            if(state.subscriber) {
                state.subscriber();
            }
        }
    }

}

export default articles;