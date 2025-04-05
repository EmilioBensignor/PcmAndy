<template>
    <AuthHeader />
    <DefaultMain>
        <Toast />
        <DefaultSection>
            <slot />
        </DefaultSection>
    </DefaultMain>
    <DefaultFooter />
</template>