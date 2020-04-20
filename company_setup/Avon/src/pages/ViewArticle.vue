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

        <v-container v-if="article.creationMethod === 'url'">
            <v-layout align-center justify-center>
                <v-flex xs12>
                    <div class="text-xs-center font-italic red--text lighten-1">
                        Article should be shown in an in-app browser...
                        <span class="font-weight-bold uppercase" @click="openBrowser">CLICK HERE</span> 
                        to visit the link...
                    </div>
                </v-flex>
            </v-layout >
        </v-container>
        
        <v-container v-else>
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
                        <v-icon small color="primary">schedule</v-icon>
                        {{ calculateTime(article.publishDate)  }} 
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
                        <span class="font-italic primary--text" @click="openBrowser">{{ article.source }}</span>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>

        <v-dialog v-model="loaderDialog" hide-overlay persistent width="300">
            <v-card color="primary" dark>
                <v-card-text>
                {{ loaderDialogMessage }}
                <v-progress-linear
                    indeterminate
                    color="white"
                    class="mb-0"
                ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

        <BottomNav currentTab="articles"/>
    </div>
</template>

<script>
import ContactsBadge from '@/components/ContactsBadge';
import BasketBadge from "@/components/BasketBadge";
import BottomNav from "@/components/BottomNav";
import Accounts from "@/components/Accounts"
import moment from 'moment';
import { parse } from 'semver';

export default {
    components: {
        ContactsBadge, BasketBadge, BottomNav, Accounts
    },

    async created() {
        this.article = this.$route.params.article;

        if(this.article.creationMethod === 'url') {
            this.openBrowser();
            this.article.description = 'this is an article that suppose to open in the in-app browser.';
        }
    },

    data: () => ({
        article: {},
        loaderDialog: false,
        loaderDialogMessage: null,
    }),

    methods: {
        goBack() {
            this.$router.go(-1);
        },

        setLoaderDialog(message, state) {
            this.loaderDialogMessage = message;
            this.loaderDialog = state;
        },

        openBrowser() {

            const url = this.article.source;
            const target = "_blank";
            const options = `location=no,
                            hardwareback=no,
                            footer=yes,
                            closebuttoncaption="CLOSE",
                            closebuttoncolor=${process.env.primaryColor},
                            footercolor=${process.env.primaryColor}`;

            this.inAppBrowserRef = cordova.InAppBrowser.open(
              url,
              target,
              options
            );    
            
            this.inAppBrowserRef.addEventListener('exit', this.goBack);
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
    }
}
</script>

<style>

</style>