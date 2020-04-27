
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
            <v-layout align-center justify-center wrap mt-2 v-if="!loading">
                <v-flex xs10>
                    <v-text-field
                        v-model="search"
                        clearable
                        rounded placeholder="search for an article..."
                    ></v-text-field>
                </v-flex>
                <v-flex xs1 offset-xs1>
                    <v-icon color="primary" @click="refreshList">cached</v-icon>
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

            <v-data-iterator
                v-else
                :items="articles" :search="search"
                row wrap class="mt-2"
                no-data-text="Sorry, no articles posted yet..."
                no-result-text="Sorry, no article/s related to your search..."
                hide-actions
                :pagination.sync="pagination"
            >
                <template v-slot:no-results>
                    <div class="red--text font-weight-bold body-1 mt-3">
                        Sorry, no articles are related to your search...
                    </div>
                </template>

                <template v-slot:no-data>
                    <div class="red--text font-weight-bold body-1 mt-3">
                        Sorry, no articles are posted yet...
                    </div>
                </template>

                <template v-slot:item="props">
                    <v-layout 
                        align-start justify-end mt-4 px-2 pb-2 wrap row
                        @click="viewArticle(props.item)" v-ripple
                        :class="[ props.item.isRead === false ? 'grey lighten-3' : '' ]"
                        v-scroll="onScroll"
                    >
                        <v-flex xs12 align-start justify-baseline align-content-baseline align-self-baseline>
                            <v-divider></v-divider>
                        </v-flex>

                        <v-flex :xs7="props.item.headerURL" :xs12="!props.item.headerURL" mt-2>
                            <div class="title font-weight-bold">{{ props.item.title }}</div>
                            
                            <div class="body-1 primary--text mt-2">
                                <v-icon small color="primary">schedule</v-icon>
                                {{ calculateTime(props.item.publishDate) }}
                            </div>
                            
                            <div class="body-1 grey--text mt-1">
                                <v-icon small color="grey">visibility</v-icon> 
                                {{ props.item.viewedBy.length }}
                            </div>
                            
                            <div class="caption font-weight-thin mt-3"> {{ summarizeSource(props.item.source) | uppercase }}</div>
                        </v-flex>
                        <v-flex xs4 offset-xs1 v-if="props.item.headerURL">
                            <v-img
                                v-if="props.item.headerURL"
                                height="100px"
                                width="100px"
                                :src="props.item.headerURL"
                                :alt="props.item.title"
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
                </template>
            </v-data-iterator>
        </v-container>
        <BottomNav currentTab="articles" ref="BottomNav"/>
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
    async created() {
        this.yLocation = this.$route.params.yLocation || 0;
        this.$vuetify.goTo(this.yLocation, this.option);
    },

    async mounted() {
        this.cordovaBackButton(this.goBack);
    },

    beforeDestroy() {
        delete this.$route.params.from;
    },

    data: () => ({
        loading: false, 
        search: null,
        yLocation: 0,

        option: {
            duration: 0,
            offset: 0,
            easing: 'easeInOutCubic'
        },

        pagination: {
            sortBy: "publishDate",
            descending: true,
            rowsPerPage: -1
        },

    }),

    methods: {
        goBack() {
            this.$router.go(-1);
        },

        toggleNav(val) {
            this.$refs.BottomNav.toggleNav(val);
        },

        onScroll(e) {
            this.yLocation = e.target.scrollingElement.scrollTop;
        },

        async refreshList() {
            this.loading = true;
            await this.$store.dispatch('articles/UNSUBSCRIBE_TO_ARTICLES');
            await this.$store.dispatch('articles/LISTEN_TO_ARTICLES');
            this.loading = false;
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
                    article,
                    prevYLocation: this.yLocation,
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
            
            return articles.map((article) => {
                article.isRead = article.viewedBy.includes(this.user.uid) ? true : false;
                return article;
            });
        }
    },
}
</script>

<style>

</style>