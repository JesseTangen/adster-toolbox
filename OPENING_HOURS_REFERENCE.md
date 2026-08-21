# Opening-Hours Interaction Reference

The supplied reference and the examined schema-generator workflow establish a practical local-business pattern: opening hours are entered as repeatable rows rather than a free-form text block. Each row associates one or more days with an opening time and closing time, supports removal, and can be combined with additional rows for different schedules.

The Toolbox implementation will use its existing visual system rather than copying the reference interface. It will retain the same essential workflow: add an hours row, select multiple days, enter times, remove an unwanted row, and emit one `OpeningHoursSpecification` per distinct row with an array of full Schema.org day names.
