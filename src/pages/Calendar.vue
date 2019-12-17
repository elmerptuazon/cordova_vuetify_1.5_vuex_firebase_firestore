<template>
	<div>

		<v-toolbar app color="primary" dark v-if="$store.state.rightAlignToolbarIcons">
			<v-btn icon @click="goBack()">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<Accounts />
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Calendar</v-toolbar-title>
			<BasketBadge tabName="msa" />
		</v-toolbar>

		<v-toolbar app color="primary" dark v-else>
			<v-btn icon @click="goBack()">
				<v-icon>arrow_back</v-icon>
			</v-btn>
			<v-toolbar-title v-if="$store.state.showToolbarTitles">Calendar</v-toolbar-title>
			<BasketBadge tabName="msa" />
			<v-spacer></v-spacer>
			<Accounts />
		</v-toolbar>

		<v-container class="pa-0">
			<v-date-picker :events="events" ref="picker" :picker-date.sync="pickerDate" scrollable color="primary" header-color="pink lighten-2" event-color="red" v-model="picker" :landscape="landscape" :reactive="reactive" full-width></v-date-picker>
			<div>
				<v-list subheader>
					<v-subheader>Events</v-subheader>
					<v-list-tile
			            v-for="(item, index) in orderBy(items, 'time', 1)"
			            :key="index"
			            avatar
			            @click="viewEvent(item)"
			          >
			            <v-list-tile-avatar>
			              <v-icon color="grey darken-2" v-if="item.orderNo">local_shipping</v-icon>
			              <v-icon color="grey darken-2" v-else>comment</v-icon>
			            </v-list-tile-avatar>

			            <v-list-tile-content>
			              <v-list-tile-title v-text="item.title"></v-list-tile-title>
			              <v-list-tile-sub-title class="grey--text text--darken-2" v-if="item.orderNo">Order {{item.orderNo}}</v-list-tile-sub-title>
			              <v-list-tile-sub-title class="grey--text text--darken-2" v-else>
			              	{{ item.text }}
			              </v-list-tile-sub-title>
			            </v-list-tile-content>

						<v-list-tile-action>
							<v-list-tile-sub-title class="grey--text text--darken-3" v-if="item.orderNo">{{item.time | toTwelveHourFormat}}</v-list-tile-sub-title>
							<v-list-tile-sub-title class="grey--text text--darken-3" v-else>{{item.time | toTwelveHourFormat}}</v-list-tile-sub-title>
						</v-list-tile-action>
			          </v-list-tile>
			        </v-list>
				</v-list>
			</div>
		</v-container>

		<v-dialog v-model="eventDialog" fullscreen transition="dialog-bottom-transition" :overlay=false>
			<v-card>
				<v-toolbar dark color="primary">
		          <v-btn icon @click.native="eventDialog = false" dark>
		            <v-icon>close</v-icon>
		          </v-btn>
		        </v-toolbar>
		        <v-list subheader v-if="selected.orderNo">
		        	<v-subheader>Order {{ selected.orderNo }}</v-subheader>
			        <v-list-tile avatar>
				        <v-list-tile-avatar>
				            <v-icon color="primary">place</v-icon>
				        </v-list-tile-avatar>

				        <v-list-tile-content>
				            <v-list-tile-title>{{ selected.proposed_delivery_schedule.location }}</v-list-tile-title>
				        </v-list-tile-content>
				    </v-list-tile>
				    <v-list-tile avatar>
				        <v-list-tile-avatar>
				            <v-icon color="primary">access_time</v-icon>
				        </v-list-tile-avatar>

				        <v-list-tile-content>
				            <v-list-tile-title>
				            	{{ selected.proposed_delivery_schedule.date }} {{ selected.time | toTwelveHourFormat }}
				        	</v-list-tile-title>
				        </v-list-tile-content>
				    </v-list-tile>
				    <v-list-tile avatar v-if="selected.proposed_delivery_schedule.remarks">
				        <v-list-tile-avatar>
				            <v-icon color="primary">comment</v-icon>
				        </v-list-tile-avatar>

				        <v-list-tile-content>
				            <v-list-tile-title>
				            	{{ selected.proposed_delivery_schedule.remarks }}
				        	</v-list-tile-title>
				        </v-list-tile-content>
				    </v-list-tile>
			    </v-list>
			</v-card>
		</v-dialog>

		<v-dialog
	      v-model="loader"
	      hide-overlay
	      persistent
	      width="100"
	    >
	      <v-card
	        color="primary"
	        dark
	      >
	        <v-card-text>
	          <div class="text-xs-center">
	          	<v-progress-circular indeterminate color="white"></v-progress-circular>
	          </div>
	        </v-card-text>
	      </v-card>
	    </v-dialog>

	    <v-dialog
	      v-model="noteDialog"
	      fullscreen
	      transition="dialog-bottom-transition"
	      :overlay=false
	    >
	      <v-card>
	      	<v-toolbar dark color="primary">
		        <v-btn icon @click.native="noteDialog = false" dark>
		           <v-icon>close</v-icon>
		        </v-btn>
		        <v-spacer></v-spacer>
		        <v-btn icon @click.native="saveNote" dark v-if="!selected.id">
		           <v-icon>check</v-icon>
		        </v-btn>
		        <v-btn icon @click.native="updateNote" dark v-else>
		           <v-icon>check</v-icon>
		        </v-btn>
		    </v-toolbar>
	        <v-card-text>
	        	<v-container grid-list-md>
	        		<v-layout wrap>
	        			<v-flex xs12 sm6 md4>
              				Note for {{ picker }}
              			</v-flex>
              			<v-flex xs12 sm6 md4>
              				<v-text-field label="Time" v-model="noteTime" type="time"></v-text-field>
              			</v-flex>
              			<v-flex xs12 sm6 md4>
              				<v-textarea v-model="noteData" label="Add your message here..." required multi-line></v-textarea>
              			</v-flex>
              		</v-layout>
              		<v-btn color="red" dark depressed v-if="selected.id" @click="deleteNote(selected.id)">
              			<v-icon left>delete</v-icon> Delete
              		</v-btn>
	        	</v-container>
	        </v-card-text>
	      </v-card>
	    </v-dialog>

	    <v-snackbar v-model="snackbar" bottom>
	    	{{snackbarMessage}}
	    </v-snackbar>

	    <v-btn
            color="primary"
            dark
            small
            fixed
            bottom
            right
            fab
            @click.stop="addNote"
        >
            <v-icon>add</v-icon>
        </v-btn>
	</div>
</template>

<script>
import BasketBadge from '@/components/BasketBadge';
import moment from 'moment';
import {mixins} from '@/mixins';

export default {
	data: () => ({
		picker: null,
		landscape: false,
		reactive: true,
		items: [],
		events: [],
		pickerDate: null,
		loader: false,
		eventDialog: false,
		selected: {},
		noteDialog: false,
		noteData: null,
		noteTime: null,
		snackbar: false,
		snackbarMessage: null
    }),
	created () {
		this.picker = this.$moment().format('YYYY-MM-DD');
	},
	methods: {
		goBack() {
			this.$router.push({name: 'MySellingAssistant'})
		},
		fetchEvents (val) {
			this.loader = true;
			this.$store.dispatch('calendar/FETCH_ORDERS_BY_MONTH', {date: val})
			.then((data) => {
				console.log(data)
				this.events = data.map((d) => {
					let date;
					if (d.orderNo) {
						date = this.$moment(d.proposed_delivery_schedule.date, 'MM/DD/YYYY').format('YYYY-MM-DD');
					} else {
						date = d.date;
					}
					return date;
				});
				this.loader = false;
			})
			.catch((error) => {
				this.loader = false;
				console.log(error);
			});
		},
		fetchDayEvents (val) {
			const date = this.$moment(val, 'YYYY-MM-DD').format('MM/DD/YYYY');
			this.$store.dispatch('calendar/FETCH_ORDERS_BY_DATE', {date})
			.then((data) => {
				this.items = data.map((d) => {
					if (d.orderNo) {
						d.title = 'Delivery';
						d.time = d.proposed_delivery_schedule.time;
					} else {
						d.title = 'Note';
					}
					return d;
				});
			})
			.catch((error) => {
				console.log(error);
			});
		},
		viewEvent (item) {
			console.log(item)
			this.selected = Object.assign({}, item);

			if (item.orderNo) {
				this.eventDialog = true;
			} else {
				this.noteData = item.text;
				this.noteTime = item.time;
				this.noteDialog = true;
			}
		},
		addNote () {
			this.noteData = null;
			this.noteTime = null;
			this.selected = {};
			this.noteDialog = true;
		},
		saveNote () {

			if (!this.noteData || !this.noteTime) {
				return;
			}

			this.loader = true;
			this.$store.dispatch('calendar/SAVE_NOTE', {
				text: this.noteData,
				date: this.picker,
				time: this.noteTime
			})
			.then((data) => {
				this.loader = false;

				this.items.push({
					title: 'Note',
					text: this.noteData,
					time: this.noteTime,
					date: this.picker,
					timestamp: data.timestamp,
					id: data.id
				});

				this.noteDialog = false;
				this.snackbarMessage = 'Note added';
				this.snackbar = true;

				this.events.push(this.picker);
			})
			.catch((error) => {
				this.loader = false;
				this.snackbarMessage = 'An error occurred';
				this.snackbar = true;
				console.log(error);
			});
		},
		updateNote () {
			if (!this.noteData || !this.noteTime) {
				return;
			}

			this.loader = true;
			this.$store.dispatch('calendar/UPDATE_NOTE', {
				text: this.noteData,
				time: this.noteTime,
				id: this.selected.id
			})
			.then(() => {
				this.loader = false;

				const i = this.items.findIndex(item => item.id === this.selected.id);
				this.items[i].text = this.noteData;
				this.items[i].time = this.noteTime;

				this.noteDialog = false;
				this.snackbarMessage = 'Note updated';
				this.snackbar = true;
			})
			.catch((error) => {
				this.loader = false;
				this.snackbarMessage = 'An error occurred';
				this.snackbar = true;
				console.log(error);
			});
		},
		deleteNote (id) {

			this.loader = true;
			this.$store.dispatch('calendar/DELETE_NOTE', id)
			.then(() => {
				this.loader = false;

				const i = this.items.findIndex(item => item.id === this.selected.id);
				this.items.splice(i, 1);

				this.noteDialog = false;
				this.snackbarMessage = 'Note removed';
				this.snackbar = true;

				const eventIndex = this.events.findIndex(item => item === this.picker);
				this.events.splice(eventIndex, 1);
			})
			.catch((error) => {
				this.loader = false;
				this.snackbarMessage = 'An error occurred';
				this.snackbar = true;
				console.log(error);
			});
		}
	},
	components: {
		BasketBadge
	},
	watch: {
		picker (val) {
			this.fetchDayEvents(val);
		},
		pickerDate (val) {
			console.log(val)
			this.fetchEvents(val);
		}
	},
	filters: {
		toTwelveHourFormat (val) {
			return moment(val, 'HH:mm').format('hh:mm a');
		}
	},
	mixins: [mixins]
}
</script>
