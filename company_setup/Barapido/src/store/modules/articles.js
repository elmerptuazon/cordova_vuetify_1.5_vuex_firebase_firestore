import { AUTH, DB, STORAGE, FIRESTORE } from '@/config/firebaseInit';
import moment from 'moment';

const articles = {
    namespaced: true,
    state: {
        subscriber: null,
        articles: [],
        badgeNotifState: true,
    },
    getters: {
        GET_ARTICLES(state) {
            return state.articles.filter(article => article.active);
        },
        GET_BADGE_NOTIF_STATE: state => state.badgeNotifState,
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

            const dateNow = moment().startOf('day').format('x');

            state.subscriber = DB.collection('articles')
                .orderBy('publishDate', 'desc')
                .onSnapshot((snapshot) => {

                    snapshot.docChanges().forEach(async (change) => {
                            
                        const data = change.doc.data();
                        data.id = change.doc.id;

                        switch(change.type) {
                            case 'added': {
                                const articleIsPublishable = data.publishDate <= moment().format('x');
                                
                                if(!state.articles.length && articleIsPublishable) {
                                    state.articles.push(data);
                                
                                } else if(articleIsPublishable) {
                                    //ensure that the latest item is not a duplicate of the last article in the list
                                    const lastItem = state.articles[state.articles.length - 1];
                                    if(lastItem.id !== data.id) { 
                                        console.log('new article arrived!');
                                        state.articles.push(data);

                                        //activate the articel badge notif
                                        state.badgeNotifState = true;
                                    }
                                }

                                break;
                            }

                            case 'modified': {
                                const articleIsPublishable = data.publishDate <= moment().format('x');
                                
                                if(articleIsPublishable) {
                                    const oldArticle = state.articles.find(article => article.id === data.id);
                                    const index = state.articles.findIndex(article => article.id === data.id);
                                    
                                    console.log('old article: ', oldArticle);
                                    console.log('an article was edited');
                                    console.log('edit article: ', change.doc.data());
                                    
                                    if(index !== - 1) {
                                        state.articles[index] = data;
                                    }
                                }

                                break;
                            }

                            default: {
                                console.log('change type is not in the option: ', change.type);
                                break;
                            }
                        }

                    });

            })
        },

        dismissArticleBadgeNotif({state}) {
            if(state.badgeNotifState) {
                state.badgeNotifState = false;
            }
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

        async ADD_USER_TO_VIEWED_BY({ state, commit }, payload) {
            const { articleId } = payload;
            const user = AUTH.currentUser;

            try {
                const index = state.articles.findIndex(article => article.id === articleId);
                if(index !== - 1) {
                    state.articles[index].viewedBy.push(user.uid);
                }
                
                await DB.collection('articles').doc(articleId).update({
                    viewedBy: FIRESTORE.FieldValue.arrayUnion(user.uid)
                });

            
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