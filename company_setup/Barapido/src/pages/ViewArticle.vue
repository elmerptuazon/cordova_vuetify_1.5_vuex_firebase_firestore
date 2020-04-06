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

        <v-container>
            <v-layout align-center justify-center wrap v-if="article.headerURL">
                <v-flex xs12>
                    <v-img  
                        :aspect-ratio="16/9"
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

            <v-divider class="my-1"></v-divider>

            <v-layout align-center justify-start mt-2 wrap>
                <v-flex xs12>
                    <div class="headline font-weight-bold text-xs-left">{{ article.title }}</div>
                    <div class="primary--text mt-3">
                        {{ formatDate(article.publishDate)  }} 
                        <v-icon small color="primary">schedule</v-icon>
                        <span class="grey--text">| Views: {{ 69 }}</span>
                    </div>
                </v-flex>
                <v-flex xs12 mt-2><v-divider></v-divider></v-flex>
            </v-layout>

            <v-layout align-center justify-start mt-4>
                <v-flex xs12>
                    <p class="text-xs-left ">
                        {{ article.description }}
                    </p>
                </v-flex>
            </v-layout>

            <v-layout align-center justify-start mt-5 wrap>
                <v-flex xs12>
                    <v-divider></v-divider>
                </v-flex>
                <v-flex xs12>
                    <div class="caption">
                        <span class="font-weight-bold">SOURCE: </span>
                        <span class="font-italic primary--text">{{ article.source }}</span>
                    </div>
                </v-flex>
            </v-layout>

        </v-container>

        <BottomNav currentTab="articles"/>
    </div>
</template>

<script>
import ContactsBadge from '@/components/ContactsBadge';
import BasketBadge from "@/components/BasketBadge";
import BottomNav from "@/components/BottomNav";
import Accounts from "@/components/Accounts"
import moment from 'moment';

export default {
    components: {
        ContactsBadge, BasketBadge, BottomNav, Accounts
    },

    async created() {
        this.article = this.$route.params.article;

        if(this.article.creationMethod === 'url') {
            this.article.description = 'this is an article that suppose to open in the in-app browser.';
        }
    },

    data: () => ({
        article: {},
    }),

    methods: {
        goBack() {
            this.$router.go(-1);
        },

        formatDate(dateTime) {
            return moment(parseInt(dateTime)).format('MMMM DD YYYY, h:mm a');
        },
    }
}
</script>

<style>

</style>