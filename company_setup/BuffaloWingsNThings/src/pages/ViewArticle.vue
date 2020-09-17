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
                        <span class="grey--text">| Views: {{ article.viewedBy.length }}</span>
                    </div>
                </v-flex>
                <v-flex xs12 mt-2><v-divider></v-divider></v-flex>
            </v-layout>

            <!-- <v-layout align-center justify-start mt-4>
                <v-flex xs12>
                    <p class="text-xs-left ">
                        {{ article.description }}
                    </p>
                </v-flex>
            </v-layout> -->

            <div ref="articleDescription" class="trix-content" v-html="article.description"></div>

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
import { mixins } from "@/mixins";
import ContactsBadge from '@/components/ContactsBadge';
import BasketBadge from "@/components/BasketBadge";
import BottomNav from "@/components/BottomNav";
import Accounts from "@/components/Accounts"
import moment from 'moment';

export default {
    mixins: [mixins],
    components: {
        ContactsBadge, BasketBadge, BottomNav, Accounts
    },

    async created() {
        this.article = this.$route.params.article;
        this.prevYLocation = this.$route.params.prevYLocation;

        if(this.article.creationMethod === 'url') {
            this.openBrowser();
            this.article.description = 'this is an article that suppose to open in the in-app browser.';
        }

        this.$vuetify.goTo(0, this.option);

    },
    mounted() {
        this.cordovaBackButton(this.goBack);
    },
    data: () => ({
        article: {},
        loaderDialog: false,
        loaderDialogMessage: null,
        option: {
            duration: 0,
            offset: 0,
            easing: 'easeInOutCubic'
        },
        prevYLocation: 0,
    }),
    methods: {
        goBack() {
            this.$router.push({
                name: 'Articles',
                params: {
                    yLocation: this.prevYLocation
                }
            });
        },

        setLoaderDialog(message, state) {
            this.loaderDialogMessage = message;
            this.loaderDialog = state;
        },

        openBrowser() {

            const url = this.article.source;
            const target = "_blank";
            const options = `location=no,hardwareback=no,footer=yes,closebuttoncaption=CLOSE,closebuttoncolor=#FFFFFF,footercolor=${process.env.primaryColor}`;

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
.trix-content {
  line-height: 1.5;
}

.trix-content * {
  box-sizing: border-box;
}

.trix-content h1 {
  font-size: 1.2em;
  line-height: 1.2;
  margin: 0;
}

.trix-content blockquote {
  margin: 0 0 0 0.3em;
  padding: 0 0 0 0.6em;
  border-left: 0.3em solid #ccc;
}

.trix-content pre {
  display: inline-block;
  width: 100%;
  vertical-align: top;
  font-family: monospace;
  font-size: 0.9em;
  margin: 0;
  padding: 0.5em;
  white-space: pre;
  background-color: #eee;
  overflow-x: auto;
}

.trix-content ul,
.trix-content ol,
.trix-content li {
  margin: 0;
  padding: 0;
}

.trix-content ul li,
.trix-content ol li,
.trix-content li li {
  margin-left: 1em;
}

.trix-content ul li::before,
.trix-content ol li::before,
.trix-content li li::before {
  content: "● ";
  color: inherit;
}

.trix-content img {
  max-width: 100%;
  height: auto;
}

.trix-content .attachment {
  display: inline-block;
  position: relative;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.trix-content .attachment a {
  color: inherit;
  text-decoration: none;
}

.trix-content a {
  color: primary;
  text-decoration: underline;
}

.trix-content .attachment a:hover,
.trix-content .attachment a:visited:hover {
  color: inherit;
}

.trix-content .attachment__caption {
  padding: 0;
  text-align: center;
}

.trix-content
  .attachment__caption
  .attachment__name
  + .attachment__size::before {
  content: " · ";
}

.trix-content .attachment--preview {
  width: 100%;
  text-align: center;
}

.trix-content .attachment--preview .attachment__caption {
  color: #666;
  font-size: 0.9em;
  line-height: 1.2;
}

.trix-content .attachment--file {
  color: #333;
  line-height: 1;
  margin: 0 2px 2px 0;
  padding: 0.4em 1em;
  border: 1px solid #bbb;
  border-radius: 5px;
}

.trix-content .attachment-gallery {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  margin: 0;
  padding: 0;
}

.trix-content .attachment-gallery .attachment {
  flex: 1 0 33%;
  padding: 0 0.5em;
  max-width: 33%;
}

.trix-content .attachment-gallery.attachment-gallery--2 .attachment,
.trix-content .attachment-gallery.attachment-gallery--4 .attachment {
  flex-basis: 50%;
  max-width: 50%;
}
</style>
