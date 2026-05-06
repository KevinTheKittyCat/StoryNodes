import { Container, Heading, Image, Input } from "@chakra-ui/react"
import {
  createFileRoute,
  Link
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiArrowLeft, FiAward, FiLock, FiUser } from "react-icons/fi"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth from "@/hooks/useAuth"
import { emailPattern, passwordRules } from "../utils"

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

// TODO: Check against backend if username or email is available
function RouteComponent() {
  const { signUpMutation, error, resetError } = useAuth()
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: localStorage.getItem("username") || "",
      password: "",
      new_password: "",
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    resetError()

    try {
      await signUpMutation.mutateAsync(data)
    } catch {
      // error is handled by useAuth hook
    }
  }

  const isEmail = (emailPattern.value).test(getValues().username);
  console.log("Is username an email?", isEmail);

  return (
    <Container
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      h="100vh"
      maxW="sm"
      alignItems="stretch"
      justifyContent="center"
      gap={4}
      centerContent
    >
      <Heading w="100%" justifyContent="center" color="ui.main" size="lg" mb={4} display="flex" alignItems="center" gap={2} flexDirection="column">
        <Image src="/assets/BaldrJsColorSmall.png" alt="Baldr Logo" height={"6em"} />
        Baldr-Stack
      </Heading>
      <Button as={Link} pl={0} variant="ghost" href="/login" w="fit-content">
        <FiArrowLeft />
        Back to Login
      </Button>
      <Heading as="h1" size="lg">
        Create an Account
      </Heading>
      <Field
        invalid={!!errors.username}
        errorText={errors.username?.message || !!error}
      >
        <InputGroup w="100%" startElement={<FiUser />}>
          <Input
            id="username"
            {...register("username", {
              required: "Username is required",
              pattern: emailPattern,
            })}
            placeholder="Username or Email"
            type="username"
          />
        </InputGroup>
      </Field>

      <InputGroup w="100%" startElement={<FiAward />}>
        <Input
          id="name"
          {...register("name", {
            required: isEmail ? "Name is required when email is used" : false,
            minLength: isEmail ? { value: 2, message: "Name must be at least 2 characters" } : false,
          })}
          placeholder="Nickname"
          type="text"
        />
      </InputGroup>

      <PasswordInput
        type="password"
        startElement={<FiLock />}
        {...register("password", passwordRules())}
        placeholder="Password"
        errors={errors}
      />
      <PasswordInput
        type="new_password"
        startElement={<FiLock />}
        {...register("new_password",
          {
            validate: (value) => {
              const password = getValues().password
              return value === password ? true : "The passwords do not match"
            },
            required: "Password confirmation is required"
          }
        )}
        placeholder="Confirm Password"
        errors={errors}
      />
      <Button variant="solid" type="submit" loading={isSubmitting} size="md">
        Sign Up
      </Button>
    </Container>
  )
}
