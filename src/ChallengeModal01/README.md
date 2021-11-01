# Challenge Modal 01

## Challenge A: Use Pre-formatted Data and Graph component to show data

There are 3 api variables listed at the top of the first challenge modal, using the `formattedApi` variable, fetch the chart data and set it’s response to chart data to get the graph to render lines that will look like this.

![Image for Challenge Modal 01, Challenge A](../../raw/main/images/01-A.png)

## Challenge B: Shape raw api response into chart data and render it

Using the `unformattedApi` route variable, fetch unformatted data and shape it to match that of the formatted data, a function called shapeChartData has been provided for you to fill out.

![Image for Challenge Modal 01, Challenge B](../../raw/main/images/01-B.png)

## Challenge C: Deal with unstable endpoint

The `unformattedApiWithErrors` route variable targets an unstable route which will randomly return 500s. Targeting this route, update the fetch functions to retry the data fetch if an error occurs.

## Challenge D: Add chart legend

Being that we have 7 lines appearing on this graph we would like to see at a glance what each color is representing. Implement a chart according to the mock.

![Image for Challenge Modal 01, Challenge D](../../raw/main/images/01-D.png)

## Challenge E: Add hover tooltip functionality to the chart legend

Hover tooltip example, note the right to left url and ellipses for text

![Image for Challenge Modal 01, Challenge E](../../raw/main/images/01-E.png)
