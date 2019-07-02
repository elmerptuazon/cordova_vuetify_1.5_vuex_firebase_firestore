<template>
    <v-dialog full-width v-model="dialog" lazy>
		<v-card>
			<v-card-text>
				<smooth-picker ref="smoothPicker" :data="data" />
			</v-card-text>
			<v-card-actions>
				<v-btn flat>OK</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
const nowYear = (new Date()).getFullYear();
const years = [];
for (let i = 1900; i <= nowYear; i++) {
	years.push(i);
}

export default {
	data: () => ({
		dialog: false,
		data: [
			{
            currentIndex: years.length - 1,
            flex: 3,
            list: years,
            textAlign: 'center',
            className: 'row-group'
          },
          {
            currentIndex: 8,
            flex: 3,
            list: [...Array(12)].map((m, i) => i + 1),
            textAlign: 'center',
            className: 'row-group'
          },
          {
            currentIndex: 1,
            flex: 3,
            list: [...Array(31)].map((d, i) => i + 1),
            onClick: this.clickOnDay,
            textAlign: 'center',
            className: 'item-group'
          }
		]
	})
}
</script>