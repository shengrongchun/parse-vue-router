<template>
  <div>
    params: {{$route.params.name}}
    <br>
    query: {{$route.query.user + " "+ $route.query.password}}
  </div>
</template>