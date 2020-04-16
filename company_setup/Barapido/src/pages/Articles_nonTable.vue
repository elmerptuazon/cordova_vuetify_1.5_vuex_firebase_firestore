
<template>
    <div>
        <v-toolbar app color="primary" dark>
            <v-btn icon @click="goBack">
                <v-icon>arrow_back</v-icon>
            </v-btn>
            
            <BasketBadge tabName="articles" />
            
            <v-spacer></v-spacer>
            <ContactsBadge/>
            <Accounts />
        </v-toolbar>

        <v-container fluid>
            <v-layout align-center justify-start wrap>
                <v-flex xs12>
                    <div class="display-1 primary--text font-weight-bold">Your reads for today...</div>
                </v-flex>
            </v-layout>
            
            <v-layout align-center justify-center wrap mt-3>
                <v-flex xs12>
                    <v-text-field
                        v-model="search"
                        rounded placeholder="search for an article..."
                    ></v-text-field>
                </v-flex>
            </v-layout>

            <v-layout 
                v-if="loading"
                align-center justify-center mt-3>
                <v-progress-circular
                color="primary"
                    indeterminate
                    width="5"
                    size="150"
                >
                    <div class="headline primary--text">Please Wait...</div>
                </v-progress-circular>    
            </v-layout>

            <v-layout 
                v-else-if="!articles.length && search"
                align-center justify-center>
                <div class="text-xs-center font-weight-bold body-2 error--text">
                    Sorry, there's no related article with your search...
                </div>
            </v-layout>

            <v-layout 
                v-else-if="!articles.length"
                align-center justify-center>
                <div class="text-xs-center font-weight-bold body-2 error--text">
                    Sorry, there's no posted articles yet...
                </div>
            </v-layout>

            <v-layout
                v-else align-start justify-end mt-4 px-2 pb-2 wrap
                v-for="article in articles" :key="article.id"
                @click="viewArticle(article)"
                :class="[ article.isRead === false ? 'grey lighten-3' : '' ]"
            >
                <v-flex xs12 align-start justify-baseline align-content-baseline align-self-baseline>
                    <v-divider></v-divider>
                </v-flex>

                <v-flex :xs7="article.headerURL" :xs12="!article.headerURL" mt-2>
                    <div class="title font-weight-bold">{{ article.title }}</div>
                    
                    <div class="body-1 primary--text mt-2">
                        <v-icon small color="primary">schedule</v-icon>
                        {{ calculateTime(article.publishDate) }}
                    </div>
                    
                    <div class="body-1 grey--text mt-2">
                        <v-icon small color="grey">visibility</v-icon> 
                        {{ article.viewedBy.length }}
                    </div>
                    
                    <div class="caption font-weight-thin mt-3"> {{ summarizeSource(article.source) | uppercase }}</div>
                </v-flex>
                <v-flex xs4 offset-xs1 v-if="article.headerURL">
                    <v-img
                        v-if="article.headerURL"
                        height="100px"
                        width="100px"
                        :src="article.headerURL"
                        :alt="article.title"
                        :lazy-src="require('@/assets/placeholder.png')"
                    >
                        <v-layout
                            slot="placeholder"
                            fill-height
                            align-center
                            justify-center
                            ma-0
                        >
                            <v-progress-circular
                                indeterminate
                                color="primary"
                            ></v-progress-circular>
                        </v-layout>
                    </v-img>
                </v-flex>
            </v-layout>
        </v-container>
        <BottomNav currentTab="articles"/>
    </div>
</template>

<script>
import { mixins } from "@/mixins";
import ContactsBadge from '@/components/ContactsBadge';
import BasketBadge from "@/components/BasketBadge";
import BottomNav from "@/components/BottomNav";
import Accounts from "@/components/Accounts";
import moment from 'moment';

export default {
    mixins: [mixins],
    components: {
        ContactsBadge, BasketBadge, BottomNav, Accounts
    },

    async mounted() {
        this.cordovaBackButton(this.goBack);
    },

    data: () => ({
        loading: false, 
        search: null,

    }),

    methods: {
        goBack() {
            this.$router.go(-1);
        },

        async viewArticle(article) {
            this.loading = true;
            const user = this.$store.getters["accounts/user"];
            const isViewed = article.viewedBy.includes(user.uid); 
            
            if(!isViewed) {
                console.log('updating viewedBy array...');
                await this.$store.dispatch('articles/ADD_USER_TO_VIEWED_BY', {
                    articleId: article.id,
                });
            }
            this.loading = false;
            this.$router.push({
                name: 'ViewArticle',
                params: {
                    article
                }
            });
        },

        summarizeSource(url) {
            url += '/';
            if(url.startsWith('http://') || url.startsWith('https://')) {
                let remover = url.startsWith('http://') ? 'http://' : 'https://';
                url = url.replace(remover, "");
            }

            if(url.startsWith('www.')) {
                url = url.replace('www.', '');
            }

            const firstSlash = url.indexOf("/");

            return url.slice(0, firstSlash);
        },

        calculateTime(dateTime) {
            let verbalizedDateTime = moment(parseInt(dateTime)).calendar();

            if(verbalizedDateTime.includes('Today')) {
                return moment(parseInt(dateTime)).fromNow();
            }

            if(verbalizedDateTime.includes('Last') || verbalizedDateTime.includes('Yesterday')) {
                return verbalizedDateTime;
            }

            return moment(parseInt(dateTime)).format('MMM D, YYYY @ h:mm a').replace('@', "at");
        },
    },

    computed: {
        user() {
            return this.$store.getters['accounts/user'];
        },

        articles() {
            let articles = this.$store.getters['articles/GET_ARTICLES'];
            let keyword = this.search;
            
            articles = articles.map((article) => {
                article.isRead = article.viewedBy.includes(this.user.uid) ? true : false;
                return article;
            });

            if(keyword) {
                keyword = keyword.toLowerCase();

                return articles.filter((article) => {
                    const summarizedSource = this.summarizeSource(article.source).toLowerCase();

                    //keyword with spaces are not recognized as a keyword
                    if(keyword >= " " && keyword <= "                                       ") {
                        return article;
                    }

                    if(article.title.toLowerCase().includes(keyword) || summarizedSource.includes(keyword)) {
                        return article;
                    }
                });    
            }
            
            return articles;
             
        }
    },
}
</script>

<style>

</style>