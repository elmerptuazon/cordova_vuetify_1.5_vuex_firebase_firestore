<template>
  <v-data-table
    :headers="headers"
    :items="items"
    hide-actions
    disable-initial-sort
    :pagination.sync="pagination"
    :loading="loading"
    :search="search"
  >
    <template slot="headers" slot-scope="props">
      <tr>
        <th
          v-for="header in props.headers"
          :key="header.text"
          :class="[
            'column sortable',
            pagination.descending ? 'desc' : 'asc',
            header.value === pagination.sortBy ? 'active' : ''
          ]"
          @click="changeSort(header.value)"
          style="padding: 0;"
        >
          <v-icon small>arrow_upward</v-icon>
          {{ header.text }}
        </th>
      </tr>
    </template>
    <template slot="items" slot-scope="props">
      <tr @click="viewOrder(props.item)">
        <!-- <td class="text-xs-center">
                    <v-badge color="red" left overlap>
                        <span slot="badge" v-if="!props.item.addedToInventory" v-html="props.item.items.length"></span>
                        <v-icon color="grey lighten-1">shopping_cart</v-icon>
                    </v-badge>
                </td> -->
        <td class="text-xs-center">{{ props.item.stockOrderReference }}</td>
        <td class="text-xs-center">{{ props.item.status | uppercase }}</td>
        <!-- <td class="text-xs-center">
          {{ props.item.discountedTotal | currency("P") }}
        </td> -->
      </tr>
    </template>
  </v-data-table>
</template>

<script>
import { date } from "@/mixins/date";

export default {
  mixins: [date],

  props: ["items", "search"],

  data: () => ({
    pagination: {
      sortBy: "status",
      descending: true,
      rowsPerPage: -1
    },
    loading: false,
    headers: [
      //   {
      //     text: "",
      //     value: "id",
      //     sortable: false,
      //     align: "center"
      //   },
      {
        text: "Reference No.",
        value: "stockOrderReference",
        align: "center"
      },
      {
        text: "Status",
        value: "status",
        align: "center"
      }
      // {
      //   text: "Cost",
      //   value: "total",
      //   align: "center"
      // }
    ]
  }),

  methods: {
    viewOrder({ id }) {
      this.$router.push({
        name: "ViewStockOrder",
        params: {
          id
        }
      });
    },

    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  },

  computed: {}
};
</script>

<style scoped>
</style>
