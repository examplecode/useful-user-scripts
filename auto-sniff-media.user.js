// ==UserScript==
// @name:zh-CN         自动嗅探页面中的视频音频资源
// @name      Automatic sniffing of media resources on the page
// @namespace    https://github.com/examplecode/useful-user-scripts/
// @version      0.1
// @description:zh-CN  X浏览器专用，调用了X浏览器的API，其它浏览器使用无效
// @description  Automatically sniffs media resources in a page when the page has finished loading
// @match        *
// @author       examplecode
// @grant        GM_EX_sniffMedia
// @run-at		 document-end
// @icon 	     data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAABMFJREFUeF7dnFuWoyAURbXnlO+q9Mq8ujKvrI71nTmVvXgJ8pD7AkznK5VShM25hwui89T5c3t9fvpL/rLf14+gGuq3xfw9f/vff5bHZbG/96v03ONSBoqCoUEEgEhXXwy4PsCaATJQ5j8WARfKAcn53hKWOKAATEMoWV5aWY/L3y+SLgsniQEaCCZqmqyi2IDOAyaWwHyXUBML0O31+2uaVuczksoWLIsHigzoPeA4znRIJEC31/UpMFwLqgRU1PK4PK+gI4ODUICs3yg4nI9N9tZ7WIhKAoXKr9RtvWISTjAgZkgt07TeaxXrA0hn6GADBwGiVxxeEVVt+nUogoYpCQjouuKqgAPjyu4LaAJ5UhUQ3pBhPeMnrW7CqjCJzNUwfVmFdAgI6TtVnzlnUnms9iIgLJzSEHpOKPCs+wAQ3Hcel2e2HCRkTGg0ODZvDQINyxdc8S4djq6VJgcaPm3J+lECCFfRfPyW4ZTjHXfdBgLSRaadzQKUC618Q+vD/jkApUP/DhCukmmjqXBMkjg8xKws9yqKAEGNOQdHL7FG87Rj5URr1aqCvVchc7G686INEK4HQerJmt57DPteRSRAsfdAQ6vzVILj5FvnBoA44ZX6RwoxF4KcNlTPtbeHSCuee0DInk1C5/aK4YJCsNpCxgFbHfFzSXdVE2ZaQTj/2apte0jnD9G69B5Qufz9HQhiPSKO8bWpyjXlWEDQ8EL3aQni4cSW2+txLYnlaRW2BpQlWpq7MdaFDpctkBYS1Hm9zvST0WqyJ9SzahP20BsD0uWF7dKA+mawNfV4FUEAwRbnDHCKF70voOriXOpDFEDzvbuCcjPmtDFHqoaFVM4A4GHrR+qZcBLVfNx51XXgcjjQ4eB8bSwg0H2pyBvRIZVXENpvF6Ug5C0droDc+SpJVJ8ft91OJ5vh2raF9EG5ZSwEaBoIqASaF0ZH3UcZyUZ4EECCbSARAOkQO9tODRG/EQqxswFqoxyffGJNekge1N973h1Qs5BKE1CsnWgFUVJwgM+CDmkbUhlAyJRmyGze50ESu1BB/UCcrKqJtVsP6jmSdQupEB5l1WIEoOo8DKoI7HH4GcNuybWHD/X1G6563KoD4bYPtu/U8fCFLUrptXPw6tFzQs0mBNTCh4b4DV89Xu0BIOkwGxdS9MQwHWHjzQuSKhpmyKqZnPwuXDePAEmrCLbVtuYh2P9z4MSbzDMbqLDpeLX6XZUkCWdn0j5uxVWkiu4CiQdH40geUShs4hRXkeXfzrgpmfJe+/m6FQA1UdEGSX2RmodJbcgq3dCU2kheNaL0ALNoTwUlBcbUq6zsyqMIrUItwbU9C2+g7V8g4J/raPGYOfFRBG/a3SARVMg+pTp4AJ72aelH7AayCoBspKgC4malrBY0PRk2gQYBMpCwdwSato5ZODzdAAP6fyDBlON6AAUoCDd1H/0Mu+IxSiItvaAB+dHtrUKuOlqVSJMBvU/Iwf0mB4kFyENS30g72jEhgj2WFFLxRdiAopCTeMMUFkR8vAgYsknXaj8wHRAF0wzQXlFdQq8JmOaAQqUZVYnB2l6OUnsXSE3tkP+LeRDkYj6PCt+2oMG51wS63Cp4HaB7VaDZy9gDStiWf9WTJN8VZm29AAAAAElFTkSuQmCC
// ==/UserScript==


!function() {
	GM_EX_sniffMedia();
} ();